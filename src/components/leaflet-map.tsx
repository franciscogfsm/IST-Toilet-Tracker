import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
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
  Plus,
  Minus,
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
  filteredBathrooms?: Bathroom[];
  isModalOpen?: boolean;
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

// Custom Zoom Controls Component
function CustomZoomControls() {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn(0.5);
  };

  const zoomOut = () => {
    map.zoomOut(0.5);
  };

  return (
    <div className="absolute bottom-16 right-2 z-[900]">
      <div className="bg-white/90 dark:bg-gray-900/90 supports-[backdrop-filter]:backdrop-blur rounded-xl p-1 shadow-lg border border-gray-200/60 dark:border-gray-700/60">
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg touch-manipulation transition-all duration-200"
            title="Zoom +"
          >
            <Plus className="h-3.5 w-3.5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg touch-manipulation transition-all duration-200"
            title="Zoom -"
          >
            <Minus className="h-3.5 w-3.5 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
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

export function LeafletMap({
  onBathroomSelect,
  filteredBathrooms,
  isModalOpen = false,
}: LeafletMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);
  const [resetToCenter, setResetToCenter] = useState(false);
  const [internalFilteredBathrooms, setInternalFilteredBathrooms] =
    useState<Bathroom[]>(bathrooms);
  const [showFilters, setShowFilters] = useState(true); // Start with filters open by default
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableBathrooms, setEditableBathrooms] =
    useState<Bathroom[]>(bathrooms);
  const [selectedEditBathroom, setSelectedEditBathroom] = useState<string>("");
  // Show a short hint telling users to tap a marker (persist once per device)
  const [showTouchHint, setShowTouchHint] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("map_hint_v1");
      if (!seen) {
        setShowTouchHint(true);
        const t = setTimeout(() => setShowTouchHint(false), 7000);
        return () => clearTimeout(t);
      }
    } catch (_) {
      // ignore storage issues
    }
  }, []);

  // Auto-dismiss location error toast after 2 seconds
  useEffect(() => {
    if (!locationError) return;
    const t = setTimeout(() => setLocationError(null), 2000);
    return () => clearTimeout(t);
  }, [locationError]);

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
          // If user is not at IST, do not show a fake current location
          setUserLocation(null);
          setLocationError("Fora do campus detectado — sem localização atual");
          // Optionally recenter to IST to keep context
          setResetToCenter(true);
          setTimeout(() => setResetToCenter(false), 1200);
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
    const bathroomsToUse = isEditMode
      ? editableBathrooms
      : filteredBathrooms || internalFilteredBathrooms;
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

        // Default to static distance when user location isn't available
        let distance = bathroom.distance ?? 0;
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

  // Global prevention of any tooltip or popup
  useEffect(() => {
    const removeTooltips = () => {
      const markers = document.querySelectorAll(".leaflet-marker-icon");
      markers.forEach((marker) => {
        marker.removeAttribute("title");
        marker.removeAttribute("alt");
        (marker as HTMLElement).style.pointerEvents = "auto";
      });

      // Remove any stray popups or tooltips
      const popups = document.querySelectorAll(
        ".leaflet-popup, .leaflet-tooltip"
      );
      popups.forEach((popup) => {
        (popup as HTMLElement).style.display = "none";
      });
    };

    // Run immediately and on interval to catch dynamically added markers
    removeTooltips();
    const interval = setInterval(removeTooltips, 100);

    return () => clearInterval(interval);
  }, [bathroomsWithCoords]);

  // Clear selected bathroom when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSelectedBathroom(null);
    }
  }, [isModalOpen]);

  const handleBathroomClick = (bathroom: Bathroom) => {
    // Dismiss the hint once the user interacts with markers
    if (showTouchHint) {
      try {
        localStorage.setItem("map_hint_v1", "1");
      } catch (_) {}
      setShowTouchHint(false);
    }
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
    setInternalFilteredBathrooms(filtered);
  };

  const handlePositionUpdate = (bathroomId: string, x: number, y: number) => {
    setEditableBathrooms((prev) =>
      prev.map((bathroom) =>
        bathroom.id === bathroomId ? { ...bathroom, x, y } : bathroom
      )
    );

    // Also update filtered bathrooms if they include this bathroom
    setInternalFilteredBathrooms((prev) =>
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
    // Create a local stacking context so map overlays never escape above the page header/modal
    <div
      className={`relative isolate z-0 w-full h-[40vh] sm:h-[45vh] md:h-[55vh] lg:h-[500px] min-h-[300px] max-h-[600px] ${
        isModalOpen ? "pointer-events-none" : ""
      }`}
    >
      {/* Keep Leaflet internals under the header/modal (extra safety) */}
      <style>
        {`
          .leaflet-container { z-index: 0 !important; }
          .leaflet-top, .leaflet-bottom { z-index: 1 !important; }
        `}
      </style>
      {/* Simplified Map Controls for Mobile */}
      <div className="absolute top-2 left-2 z-[900] flex flex-col gap-1">
        <div className="bg-white/90 dark:bg-gray-900/90 supports-[backdrop-filter]:backdrop-blur rounded-xl p-1 shadow-lg border border-gray-200/60 dark:border-gray-700/60">
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg touch-manipulation transition-all duration-200"
              title="Localização"
            >
              <Locate
                className={`h-3.5 w-3.5 text-blue-600 ${
                  isLocating ? "animate-spin" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="w-8 h-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg touch-manipulation transition-all duration-200"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              disabled={isEditMode}
              className={`w-8 h-8 p-0 rounded-lg touch-manipulation transition-all duration-200 ${
                showFilters
                  ? "bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  : "hover:bg-purple-50 dark:hover:bg-purple-950/50"
              }`}
              title="Filtros"
            >
              <Filter
                className={`h-3.5 w-3.5 ${
                  showFilters ? "text-purple-600" : "text-gray-600"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEditMode}
              className={`w-8 h-8 p-0 rounded-lg touch-manipulation transition-all duration-200 ${
                isEditMode
                  ? "bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                  : "hover:bg-orange-50 dark:hover:bg-orange-950/50"
              }`}
              title="Editar"
            >
              <Edit3
                className={`h-3.5 w-3.5 ${
                  isEditMode ? "text-orange-600" : "text-gray-600"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Mode Panel */}
      {isEditMode && (
        <div className="absolute top-2 sm:top-4 left-12 sm:left-20 z-[1000] w-72 sm:w-80">
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

      {/* Filters Panel - Removed from overlay, will be moved to parent component */}

      {/* Error/Status Messages */}
      {locationError && (
        <div className="absolute top-20 left-3 right-3 z-[1200] bg-yellow-50/95 dark:bg-yellow-950/95 backdrop-blur-sm border border-yellow-200/60 dark:border-yellow-800/60 text-yellow-800 dark:text-yellow-200 px-2.5 py-1.5 rounded-xl text-[11px] shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <span className="font-medium">{locationError}</span>
          </div>
        </div>
      )}

      {/* Compact Map Legend for Mobile */}
      <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 supports-[backdrop-filter]:backdrop-blur rounded-xl p-2 shadow-lg border border-gray-200/60 dark:border-gray-700/60 z-[900] max-w-[150px]">
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-foreground mb-1 text-center">
            Legenda
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ring-1 ring-white/60"></div>
              <span className="text-muted-foreground text-[9px] leading-tight">
                Excelente
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 ring-1 ring-white/60"></div>
              <span className="text-muted-foreground text-[9px] leading-tight">
                Bom
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ring-1 ring-white/60"></div>
              <span className="text-muted-foreground text-[9px] leading-tight">
                Básico
              </span>
            </div>
            <div className="border-t border-border/30 pt-1 mt-1">
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-2 h-2 bg-blue-500 rounded-full border border-white flex-shrink-0 ring-1 ring-white/60"></div>
                <span className="text-muted-foreground text-[9px] leading-tight">
                  Você
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={IST_CENTER}
        zoom={17}
        className="w-full h-full rounded-2xl touch-none ring-1 ring-gray-200/40 dark:ring-gray-700/40 shadow-xl overflow-hidden"
        zoomControl={false} // We have custom controls
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        zoomSnap={0.25}
        zoomDelta={0.5}
        minZoom={15}
        maxZoom={20}
        attributionControl={false} // Hide attribution for cleaner mobile view
        preferCanvas={true}
        wheelPxPerZoomLevel={40}
        trackResize={true}
        bounceAtZoomLimits={true}
        maxBounds={[
          [IST_BOUNDS[0][0] - 0.002, IST_BOUNDS[0][1] - 0.002],
          [IST_BOUNDS[1][0] + 0.002, IST_BOUNDS[1][1] + 0.002],
        ]}
        maxBoundsViscosity={0.8}
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

        <CustomZoomControls />

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
            <Marker
              position={userLocation}
              icon={userLocationIcon}
              title=""
              alt=""
              eventHandlers={{
                mouseover: (e) => {
                  // Prevent any default tooltip behavior
                  e.target.getElement()?.removeAttribute("title");
                  e.target.getElement()?.removeAttribute("alt");
                },
              }}
            >
              {/* Popup removed to avoid overlay conflicts with modal */}
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
              title=""
              alt=""
              eventHandlers={{
                click: () => handleBathroomClick(bathroom),
                mouseover: (e) => {
                  // Prevent any default tooltip behavior
                  e.target.getElement()?.removeAttribute("title");
                  e.target.getElement()?.removeAttribute("alt");
                },
              }}
            >
              {/* Popup removed to avoid overlay conflicts with modal */}
            </Marker>
          ))}
      </MapContainer>

      {/* Selected bathroom details */}
      {selectedBathroom && !isModalOpen && (
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

      {/* Coachmark overlay to make it obvious to tap a pin */}
      {showTouchHint && !isEditMode && !isModalOpen && (
        <div className="absolute inset-0 z-[1100] pointer-events-none">
          {/* dim background (no pointer events to keep map clickable) */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          {/* floating pill */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-16 sm:bottom-20 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/60 shadow-xl">
              <span className="text-base">👆</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                Toque num pin para avaliar
              </span>
              <button
                className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  try {
                    localStorage.setItem("map_hint_v1", "1");
                  } catch {}
                  setShowTouchHint(false);
                }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Instructions / Hint (no counters) */}
      {(isEditMode || showTouchHint) && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] leading-tight z-[800] border border-gray-200/30 dark:border-gray-700/30 shadow-md">
          {isEditMode ? (
            <div className="w-full text-center">
              {selectedEditBathroom ? (
                <span className="text-green-600 font-medium">
                  🎯 Clique no mapa para reposicionar
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  ✏️ Clique numa casa de banho
                </span>
              )}
            </div>
          ) : (
            showTouchHint && (
              <div className="w-full flex items-center justify-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 shadow-sm"
                  onClick={() => {
                    try {
                      localStorage.setItem("map_hint_v1", "1");
                    } catch (_) {}
                    setShowTouchHint(false);
                  }}
                  title="Dica"
                >
                  <span className="animate-pulse">👆</span>
                  <span className="hidden sm:inline">Toque num pin</span>
                  <span className="sm:hidden">Toque num pin</span>
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
