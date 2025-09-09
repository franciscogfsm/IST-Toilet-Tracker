import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useUserSettings } from "@/hooks/use-user-settings";

export default function Settings() {
  const { settings, update, reset } = useUserSettings();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/85 supports-[backdrop-filter]:backdrop-blur-xl border-b border-gray-200/40 dark:border-gray-700/40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Definições
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Card className="border-gray-200/60 dark:border-gray-700/60">
          <CardHeader>
            <CardTitle>Tema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tema do site</Label>
              <Select
                value={settings.theme}
                onValueChange={(v: any) => update("theme", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tema</SelectLabel>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion">Reduzir animações</Label>
              <Switch
                id="reduce-motion"
                checked={settings.reduceMotion}
                onCheckedChange={(v) => update("reduceMotion", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 dark:border-gray-700/60">
          <CardHeader>
            <CardTitle>Mapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Piso por defeito</Label>
              <Select
                value={settings.defaultFloor ?? ""}
                onValueChange={(v: string) => update("defaultFloor", v || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os pisos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pisos</SelectLabel>
                    <SelectItem value="">Todos</SelectItem>
                    {[
                      "-2",
                      "-1",
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "11",
                    ].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f === "0" ? "R/C" : f}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="distance-off">
                Mostrar distância fora do campus
              </Label>
              <Switch
                id="distance-off"
                checked={settings.showDistanceOffCampus}
                onCheckedChange={(v) => update("showDistanceOffCampus", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={reset}>
            Repor definições
          </Button>
        </div>
      </main>
    </div>
  );
}
