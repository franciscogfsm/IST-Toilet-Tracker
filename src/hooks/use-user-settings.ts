import { useEffect, useState } from "react";

export type UserSettings = {
  theme: "system" | "light" | "dark";
  reduceMotion: boolean;
  defaultFloor: string | null; // e.g., "0", "1", "-1" or null for all
  showDistanceOffCampus: boolean;
};

const STORAGE_KEY = "ist_toilet_settings_v1";

const defaultSettings: UserSettings = {
  theme: "system",
  reduceMotion: false,
  defaultFloor: "0",
  showDistanceOffCampus: false,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw)
        return { ...defaultSettings, ...JSON.parse(raw) } as UserSettings;
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply reduce-motion class globally
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reduceMotion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
  }, [settings.reduceMotion]);

  return {
    settings,
    setSettings,
    update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    reset() {
      setSettings(defaultSettings);
    },
  } as const;
}
