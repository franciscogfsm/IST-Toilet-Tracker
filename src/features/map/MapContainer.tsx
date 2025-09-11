import { useState, useMemo } from "react";
import { Bathroom } from "@/types";
import { LocationService } from "@/services/locationService";

const locationService = LocationService.getInstance();

interface MapContainerProps {
  bathrooms: Bathroom[];
  userLocation: [number, number] | null;
  isNearIST: boolean;
  onBathroomSelect: (bathroom: Bathroom | null) => void;
  selectedBathroom: Bathroom | null;
  defaultFloor: string | null;
}

export function MapContainer({
  bathrooms,
  userLocation,
  isNearIST,
  onBathroomSelect,
  selectedBathroom,
  defaultFloor,
}: MapContainerProps) {
  const [selectedFloor, setSelectedFloor] = useState<string>(
    defaultFloor || "0"
  );

  // Filter bathrooms by selected floor
  const floorFilteredBathrooms = useMemo(() => {
    return bathrooms.filter((b) => b.floor === selectedFloor);
  }, [bathrooms, selectedFloor]);

  // Add dynamic distance to bathrooms when location is available
  const bathroomsWithDistance = useMemo(() => {
    if (!(isNearIST && userLocation)) {
      return floorFilteredBathrooms;
    }

    return floorFilteredBathrooms.map((bathroom) => {
      const [lat, lng] = locationService.convertToRealCoords(
        bathroom.x,
        bathroom.y
      );
      const distance = locationService.calculateDistance(
        userLocation[0],
        userLocation[1],
        lat,
        lng
      );

      return {
        ...bathroom,
        dynamicDistance: distance,
      };
    });
  }, [floorFilteredBathrooms, userLocation, isNearIST]);

  const uniqueFloors = useMemo(() => {
    const floors = bathrooms.map((b) => b.floor);
    return [...new Set(floors)].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  }, [bathrooms]);

  return (
    <div className="space-y-4">
      {/* Floor selector */}
      <div className="flex flex-wrap gap-2">
        {uniqueFloors.map((floor) => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedFloor === floor
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Piso {floor}
          </button>
        ))}
      </div>

      {/* Map visualization placeholder - in a real app, this would render the actual map */}
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          Interactive map would be rendered here with{" "}
          {bathroomsWithDistance.length} bathrooms
        </p>
        {selectedBathroom && (
          <p className="mt-2 text-blue-600">
            Selected: {selectedBathroom.name}
          </p>
        )}
      </div>
    </div>
  );
}
