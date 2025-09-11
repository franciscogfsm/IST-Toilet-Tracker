import { useState, useEffect, useRef } from "react";
import { LocationState } from "@/types";
import { LocationService } from "@/services/locationService";

const locationService = LocationService.getInstance();

export function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({
    userLocation: null,
    isNearIST: false,
    locationStatus: "idle",
  });

  const autoPromptedRef = useRef(false);

  const requestLocation = async () => {
    setLocationState((prev) => ({ ...prev, locationStatus: "requesting" }));

    const newState = await locationService.requestLocation();
    setLocationState(newState);
  };

  // Auto-prompt for location when map becomes visible
  useEffect(() => {
    if (locationState.locationStatus !== "idle" || autoPromptedRef.current)
      return;

    // Avoid re-prompting across sessions
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("geo_prompted_v1")
    ) {
      autoPromptedRef.current = true;
      return;
    }

    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !autoPromptedRef.current) {
            autoPromptedRef.current = true;
            try {
              localStorage.setItem("geo_prompted_v1", "1");
            } catch {}
            requestLocation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(mapEl);
    return () => observer.disconnect();
  }, [locationState.locationStatus]);

  // Check for existing geolocation permission
  useEffect(() => {
    if (locationState.locationStatus !== "idle" || autoPromptedRef.current)
      return;

    locationService.checkGeolocationPermission().then((hasPermission) => {
      if (hasPermission) {
        autoPromptedRef.current = true;
        requestLocation();
      }
    });
  }, [locationState.locationStatus]);

  return {
    ...locationState,
    requestLocation,
  };
}
