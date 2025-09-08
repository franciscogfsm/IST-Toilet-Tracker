import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import {
  MapPin,
  Star,
  Navigation,
  Accessibility,
  Locate,
  RotateCcw,
  Filter,
  Edit3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bathrooms, Bathroom } from "@/data/bathrooms";
import { BathroomFilters } from "@/components/bathroom-filters";
import { MapClickHandler, EditModeControls } from "@/components/map-editor";
import "leaflet/dist/leaflet.css";

// IST Alameda coordinates
const IST_CENTER: [number, number] = [38.7369, -9.1395];
const IST_BOUNDS: [[number, number], [number, number]] = [
  [38.734, -9.143], // Southwest
  [38.74, -9.136], // Northeast
];

interface LeafletMapProps {
  onBathroomSelect?: (bathroom: Bathroom) => void;
}

// Custom component to handle map events
function MapController({
  userLocation,
  resetToCenter,
}: {
  userLocation: [number, number] | null;
  resetToCenter: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 18, {
        animate: true,
      });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (resetToCenter) {
      map.setView(IST_CENTER, 17, {
        animate: true,
      });
    }
  }, [resetToCenter, map]);

  // Force map to invalidate size on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Custom bathroom marker icon
const createBathroomIcon = (rating: number, isSelected: boolean = false) => {
  const color = rating >= 4 ? "#0080C7" : rating >= 3.5 ? "#f59e0b" : "#ef4444";
  const borderColor = isSelected ? "#ff0000" : color;
  const borderWidth = isSelected ? "4" : "0";

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 15 15 25 15 25s15-10 15-25C30 6.716 23.284 0 15 0z" fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
        <circle cx="15" cy="15" r="8" fill="white"/>
        <path d="M15 8c-1.105 0-2 .895-2 2v6c0 1.105.895 2 2 2s2-.895 2-2v-6c0-1.105-.895-2-2-2z" fill="${color}"/>
        <circle cx="15" cy="12" r="2" fill="${color}"/>
        ${
          isSelected
            ? '<circle cx="15" cy="15" r="12" fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="3,3"/>'
            : ""
        }
      </svg>
    `)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
};

// User location marker
const userLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#0080C7" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `)}`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function LeafletMap({ onBathroomSelect }: LeafletMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);
  const [resetToCenter, setResetToCenter] = useState(false);
  const [filteredBathrooms, setFilteredBathrooms] =
    useState<Bathroom[]>(bathrooms);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableBathrooms, setEditableBathrooms] =
    useState<Bathroom[]>(bathrooms);
  const [selectedEditBathroom, setSelectedEditBathroom] = useState<string>("");

  // Convert bathroom positions to real coordinates within IST bounds
  const convertToRealCoords = (x: number, y: number): [number, number] => {
    // Validate input
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      isNaN(x) ||
      isNaN(y)
    ) {
      console.warn("Invalid x or y coordinates:", { x, y });
      return IST_CENTER; // Return center as fallback
    }

    // Clamp values to 0-100 range
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    const lat =
      IST_BOUNDS[1][0] -
      (clampedY / 100) * (IST_BOUNDS[1][0] - IST_BOUNDS[0][0]);
    const lng =
      IST_BOUNDS[0][1] +
      (clampedX / 100) * (IST_BOUNDS[1][1] - IST_BOUNDS[0][1]);

    // Validate output
    if (isNaN(lat) || isNaN(lng)) {
      console.warn("Generated invalid coordinates:", {
        lat,
        lng,
        x: clampedX,
        y: clampedY,
      });
      return IST_CENTER;
    }

    return [lat, lng];
  };

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada por este navegador.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [latitude, longitude];

        // Check if user is within IST bounds (with some tolerance)
        const tolerance = 0.005; // ~500m tolerance
        if (
          latitude >= IST_BOUNDS[0][0] - tolerance &&
          latitude <= IST_BOUNDS[1][0] + tolerance &&
          longitude >= IST_BOUNDS[0][1] - tolerance &&
          longitude <= IST_BOUNDS[1][1] + tolerance
        ) {
          setUserLocation(userPos);
        } else {
          // If user is not at IST, set location to IST center
          setUserLocation(IST_CENTER);
          setLocationError(
            "Localização definida para o IST (fora do campus detectado)"
          );
        }
        setIsLocating(false);
      },
      (error) => {
        setLocationError(`Erro de localização: ${error.message}`);
        setUserLocation(IST_CENTER); // Fallback to IST center
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Get bathrooms with distances from user location
  const getBathroomsWithDistances = () => {
    const bathroomsToUse = isEditMode ? editableBathrooms : filteredBathrooms;
    return bathroomsToUse
      .map((bathroom) => {
        const [lat, lng] = convertToRealCoords(bathroom.x, bathroom.y);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for bathroom ${bathroom.id}:`, {
            lat,
            lng,
            x: bathroom.x,
            y: bathroom.y,
          });
          return null;
        }

        let distance = 0;
        if (userLocation) {
          distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            lat,
            lng
          );
        }

        return {
          ...bathroom,
          realCoords: [lat, lng] as [number, number],
          distance: Math.round(distance),
        };
      })
      .filter(
        (bathroom): bathroom is NonNullable<typeof bathroom> =>
          bathroom !== null
      )
      .sort((a, b) => a.distance - b.distance);
  };

  const bathroomsWithCoords = getBathroomsWithDistances();

  const handleBathroomClick = (bathroom: Bathroom) => {
    if (isEditMode) {
      // In edit mode, select the bathroom for repositioning
      setSelectedEditBathroom(bathroom.id);
    } else {
      // In normal mode, show bathroom details
      setSelectedBathroom(bathroom.id);
      onBathroomSelect?.(bathroom);
    }
  };

  const resetView = () => {
    setUserLocation(null);
    setLocationError(null);
    setResetToCenter(true);
    setTimeout(() => setResetToCenter(false), 2000); // Reset flag after animation
  };

  const handleFilterChange = (filtered: Bathroom[]) => {
    setFilteredBathrooms(filtered);
  };

  const handlePositionUpdate = (bathroomId: string, x: number, y: number) => {
    setEditableBathrooms((prev) =>
      prev.map((bathroom) =>
        bathroom.id === bathroomId ? { ...bathroom, x, y } : bathroom
      )
    );

    // Also update filtered bathrooms if they include this bathroom
    setFilteredBathrooms((prev) =>
      prev.map((bathroom) =>
        bathroom.id === bathroomId ? { ...bathroom, x, y } : bathroom
      )
    );
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setShowFilters(false); // Close filters when entering edit mode
    }
  };

  const savePositions = () => {
    // Generate the complete bathrooms.ts file content
    const bathroomsCode = `export interface Bathroom {
  id: string;
  name: string;
  building: string;
  floor: string;
  accessibility: string;
  x: number;
  y: number;
}

export const bathrooms: Bathroom[] = [
${editableBathrooms
  .map(
    (bathroom) =>
      `  {
    id: "${bathroom.id}",
    name: "${bathroom.name}",
    building: "${bathroom.building}",
    floor: "${bathroom.floor}",
    accessibility: "${bathroom.accessibility}",
    x: ${bathroom.x.toFixed(1)},
    y: ${bathroom.y.toFixed(1)},
  }`
  )
  .join(",\n")}
];`;

    // Try to copy to clipboard
    navigator.clipboard
      .writeText(bathroomsCode)
      .then(() => {
        alert(
          `✅ Posições guardadas!\n\nO código foi copiado para a clipboard.\n\nCola-o em src/data/bathrooms.ts para guardar permanentemente.\n\nTotal: ${editableBathrooms.length} casas de banho atualizadas.`
        );
      })
      .catch(() => {
        // Fallback: download file
        const blob = new Blob([bathroomsCode], { type: "text/typescript" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "bathrooms.ts";
        link.click();
        URL.revokeObjectURL(url);

        alert(
          `Posições guardadas! O ficheiro 'bathrooms.ts' foi descarregado.\n\nSubstitua o ficheiro em src/data/bathrooms.ts\n\nTotal: ${editableBathrooms.length} casas de banho atualizadas.`
        );
      });

    console.log("Updated bathroom positions:");
    console.log(bathroomsCode);
  };

  return (
    <div className="relative w-full h-[600px]">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Locate className={`h-4 w-4 ${isLocating ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          disabled={isEditMode}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Filter className={`h-4 w-4 ${showFilters ? "text-primary" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditMode}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Edit3 className={`h-4 w-4 ${isEditMode ? "text-primary" : ""}`} />
        </Button>
      </div>

      {/* Edit Mode Panel */}
      {isEditMode && (
        <div className="absolute top-4 left-20 z-[1000] w-80">
          <EditModeControls
            isEditMode={isEditMode}
            onToggleEditMode={toggleEditMode}
            onSavePositions={savePositions}
            bathrooms={editableBathrooms}
            selectedBathroom={selectedEditBathroom}
            onSelectBathroom={setSelectedEditBathroom}
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && !isEditMode && (
        <div className="absolute top-4 left-20 z-[1000] w-80 max-h-[500px] overflow-y-auto">
          <BathroomFilters
            onFilterChange={handleFilterChange}
            allBathrooms={bathrooms}
          />
        </div>
      )}

      {/* Error/Status Messages */}
      {locationError && (
        <div className="absolute top-4 left-20 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg text-sm max-w-xs">
          {locationError}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border/50 z-[1000]">
        <div className="space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">
            Legenda
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Excelente (4+★)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-muted-foreground">Bom (3.5+★)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Básico (&lt;3.5★)</span>
          </div>
          <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/50">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
            <span className="text-muted-foreground">Sua localização</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={IST_CENTER}
        zoom={17}
        className="w-full h-full rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        zoomSnap={1}
        zoomDelta={1}
        minZoom={14}
        maxZoom={19}
        attributionControl={true}
        preferCanvas={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={1}
          tileSize={256}
          zoomOffset={0}
          crossOrigin={true}
          updateWhenIdle={true}
          updateWhenZooming={true}
          keepBuffer={2}
        />

        <MapController
          userLocation={userLocation}
          resetToCenter={resetToCenter}
        />

        <MapClickHandler
          isEditMode={isEditMode}
          onPositionUpdate={handlePositionUpdate}
          bathrooms={editableBathrooms}
          selectedBathroom={selectedEditBathroom}
          onSelectBathroom={setSelectedEditBathroom}
        />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">Sua Localização</h3>
                  <p className="text-xs text-muted-foreground">
                    Campus IST Alameda
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Accuracy circle */}
            <Circle
              center={userLocation}
              radius={10}
              pathOptions={{
                color: "#0080C7",
                fillColor: "#0080C7",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Bathroom Markers */}
        {bathroomsWithCoords
          .filter(
            (bathroom) =>
              bathroom.realCoords &&
              bathroom.realCoords.length === 2 &&
              !isNaN(bathroom.realCoords[0]) &&
              !isNaN(bathroom.realCoords[1])
          )
          .map((bathroom) => (
            <Marker
              key={bathroom.id}
              position={bathroom.realCoords}
              icon={createBathroomIcon(
                bathroom.rating,
                isEditMode && selectedEditBathroom === bathroom.id
              )}
              eventHandlers={{
                click: () => handleBathroomClick(bathroom),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{bathroom.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {bathroom.building}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Piso:</strong> {bathroom.floor}
                  </p>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < bathroom.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({bathroom.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {bathroom.distance}m
                    </Badge>
                    <span className="text-xs font-medium text-primary">
                      {bathroom.cleanliness}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-medium ${
                        bathroom.paperSupply === "Bom"
                          ? "text-green-600"
                          : bathroom.paperSupply === "Médio"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      Papel: {bathroom.paperSupply}
                    </span>
                    {bathroom.accessibility && (
                      <span className="text-green-600 flex items-center gap-1">
                        <Accessibility className="h-3 w-3" />
                        Acessível
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Selected bathroom details */}
      {selectedBathroom && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          {(() => {
            const bathroom = bathroomsWithCoords.find(
              (b) => b.id === selectedBathroom
            );
            if (!bathroom) return null;

            return (
              <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-xl">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {bathroom.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bathroom.building}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Piso:</strong> {bathroom.floor}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBathroom(null)}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < bathroom.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({bathroom.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      {bathroom.distance}m de distância
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {bathroom.cleanliness}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-medium ${
                          bathroom.paperSupply === "Bom"
                            ? "text-green-600"
                            : bathroom.paperSupply === "Médio"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        Papel: {bathroom.paperSupply}
                      </span>
                      <span className="text-muted-foreground">
                        Privacidade: {bathroom.privacy}
                      </span>
                    </div>
                    {bathroom.accessibility && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Accessibility className="h-3 w-3" />
                        Acessível
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-center z-[1000]">
        {isEditMode ? (
          selectedEditBathroom ? (
            <>
              🎯 <strong>Casa de banho selecionada!</strong> Agora clique no
              mapa onde a quer colocar • ❌ Clique "Cancelar" para desselecionar
            </>
          ) : (
            <>
              ✏️ <strong>MODO EDIÇÃO:</strong> 1️⃣ Clique numa casa de banho no
              mapa • 2️⃣ Clique onde a quer colocar • 💾 Guardar quando terminar
            </>
          )
        ) : (
          <>
            📍 Localização • 🔄 Reset • 🔍 Filtros • ✏️ Editar • 📌 Clique nos
            pins para detalhes • {filteredBathrooms.length}/{bathrooms.length}{" "}
            casas de banho
          </>
        )}
      </div>
    </div>
  );
}
