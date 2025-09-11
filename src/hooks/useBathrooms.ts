import { useState, useMemo } from "react";
import { Bathroom, SearchFilters } from "@/types";
import { BathroomService } from "@/services/bathroomService";
import { LocationService } from "@/services/locationService";

const bathroomService = BathroomService.getInstance();
const locationService = LocationService.getInstance();

export function useBathrooms() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    building: "",
    floor: "",
    selectedBathroomId: "",
  });

  // Load bathrooms on mount
  useState(() => {
    const allBathrooms = bathroomService.getAllBathrooms();
    setBathrooms(allBathrooms);
  });

  const filteredBathrooms = useMemo(() => {
    let result = bathrooms;

    // Apply search query
    if (filters.query) {
      result = bathroomService.searchBathrooms(filters.query);
    }

    // Apply building filter
    if (filters.building) {
      result = result.filter((b) => b.building === filters.building);
    }

    // Apply floor filter
    if (filters.floor) {
      result = result.filter((b) => b.floor === filters.floor);
    }

    return result;
  }, [bathrooms, filters]);

  const mapFilteredBathrooms = useMemo(() => {
    // For map: filter by NAME only (as requested), so markers show only matching names
    if (!filters.query) return bathrooms;
    return bathrooms.filter((b) =>
      b.name.toLowerCase().includes(filters.query.toLowerCase())
    );
  }, [bathrooms, filters.query]);

  const addReview = (bathroomId: string, reviewData: any) => {
    bathroomService.addReview(bathroomId, reviewData);

    // Update local state
    setBathrooms((prev) =>
      prev.map((bathroom) => {
        if (bathroom.id === bathroomId) {
          return bathroomService.getBathroomById(bathroomId) || bathroom;
        }
        return bathroom;
      })
    );
  };

  const getBathroomById = (id: string) => {
    return bathroomService.getBathroomById(id);
  };

  const getBuildings = () => bathroomService.getUniqueBuildings();
  const getFloors = () => bathroomService.getUniqueFloors();

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    bathrooms: filteredBathrooms,
    mapBathrooms: mapFilteredBathrooms,
    filters,
    updateFilters,
    addReview,
    getBathroomById,
    getBuildings,
    getFloors,
  };
}
