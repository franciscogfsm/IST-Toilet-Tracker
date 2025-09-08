import { useMapEvents } from "react-leaflet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Save, X, MapPin } from "lucide-react";
import { Bathroom } from "@/data/bathrooms";

interface MapClickHandlerProps {
  isEditMode: boolean;
  onPositionUpdate: (bathroomId: string, x: number, y: number) => void;
  bathrooms: Bathroom[];
  selectedBathroom: string;
  onSelectBathroom: (bathroomId: string) => void;
}

export function MapClickHandler({
  isEditMode,
  onPositionUpdate,
  bathrooms,
  selectedBathroom,
  onSelectBathroom,
}: MapClickHandlerProps) {
  const [pendingPosition, setPendingPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useMapEvents({
    click: (event) => {
      if (isEditMode && selectedBathroom) {
        const { lat, lng } = event.latlng;
        setPendingPosition({ lat, lng });

        // Convert GPS coordinates to percentage-based coordinates
        const IST_BOUNDS: [[number, number], [number, number]] = [
          [38.734, -9.143], // Southwest
          [38.74, -9.136], // Northeast
        ];

        // Calculate percentage position within IST bounds
        const x =
          ((lng - IST_BOUNDS[0][1]) / (IST_BOUNDS[1][1] - IST_BOUNDS[0][1])) *
          100;
        const y =
          ((IST_BOUNDS[1][0] - lat) / (IST_BOUNDS[1][0] - IST_BOUNDS[0][0])) *
          100;

        // Clamp to 0-100 range
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        onPositionUpdate(selectedBathroom, clampedX, clampedY);
        console.log(
          `Updated ${selectedBathroom} to position: x=${clampedX.toFixed(
            2
          )}%, y=${clampedY.toFixed(2)}%`
        );

        // Show feedback message
        const bathroomName = bathrooms.find(
          (b) => b.id === selectedBathroom
        )?.name;

        // Clear selection after moving
        onSelectBathroom("");

        alert(
          `✅ Posição atualizada!\n\n${bathroomName}\nNova posição: ${clampedX.toFixed(
            1
          )}%, ${clampedY.toFixed(
            1
          )}%\n\n💡 Agora pode clicar noutra casa de banho para reposicionar.`
        );
      }
    },
  });

  if (!isEditMode) return null;

  return null;
}

interface EditModeControlsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSavePositions: () => void;
  bathrooms: Bathroom[];
  selectedBathroom: string;
  onSelectBathroom: (bathroomId: string) => void;
}

export function EditModeControls({
  isEditMode,
  onToggleEditMode,
  onSavePositions,
  bathrooms,
  selectedBathroom,
  onSelectBathroom,
}: EditModeControlsProps) {
  return (
    <Card className="p-4 bg-background/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Edit3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Modo de Edição</h3>
        <Button
          variant={isEditMode ? "destructive" : "default"}
          size="sm"
          onClick={onToggleEditMode}
          className="ml-auto h-6 px-2 text-xs"
        >
          {isEditMode ? (
            <>
              <X className="h-3 w-3 mr-1" />
              Sair
            </>
          ) : (
            <>
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </>
          )}
        </Button>
      </div>

      {isEditMode && (
        <div className="space-y-3">
          {selectedBathroom ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <MapPin className="h-3 w-3" />
                <span className="font-medium">Casa de banho selecionada:</span>
              </div>
              <p className="text-green-600 font-medium">
                {bathrooms.find((b) => b.id === selectedBathroom)?.name}
              </p>
              <p className="text-green-500 mt-1">
                💡 Agora clique no mapa onde quer colocar esta casa de banho.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectBathroom("")}
                className="mt-2 h-6 px-2 text-xs"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <MapPin className="h-3 w-3" />
                <span className="font-medium">Como usar:</span>
              </div>
              <ol className="text-blue-600 space-y-1">
                <li>
                  1. 🖱️ <strong>Clique numa casa de banho</strong> no mapa
                </li>
                <li>
                  2. 📍 <strong>Clique no local</strong> onde a quer colocar
                </li>
                <li>
                  3. 💾 <strong>Repita</strong> para outras casas de banho
                </li>
                <li>
                  4. ✅ <strong>Clique "Guardar"</strong> quando terminar
                </li>
              </ol>
            </div>
          )}

          <Button
            onClick={onSavePositions}
            size="sm"
            className="w-full h-8 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Guardar Todas as Posições
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            {bathrooms.length} casas de banho para posicionar
          </div>
        </div>
      )}
    </Card>
  );
}
