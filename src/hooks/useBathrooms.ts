import { useState, useEffect, useMemo } from "react";
import { Bathroom, SearchFilters } from "@/types";
import { BathroomService } from "@/services/bathroomService";

export function useBathrooms() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<{
    totalReviews: number;
    avgRating: number;
    buildingsCount: number;
    mostCommonCleanliness: string;
  } | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    building: "",
    floor: "",
    selectedBathroomId: "",
  });

  // Load bathrooms on mount - OPTIMIZED: Single API call instead of 5
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Single optimized API call that gets all data at once
        const allData = await BathroomService.getAllDataOptimized();

        setBathrooms(allData.bathrooms);
        setBuildings(allData.buildings);
        setFloors(allData.floors);
        setStatistics(allData.statistics);
        setRecentReviews(allData.recentReviews);
      } catch (err) {
        console.error("Error loading bathrooms:", err);
        setError("Erro ao carregar dados dos banheiros");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredBathrooms = useMemo(() => {
    if (loading) return [];

    let result = bathrooms;

    // Apply search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (bathroom) =>
          bathroom.name.toLowerCase().includes(query) ||
          bathroom.building.toLowerCase().includes(query) ||
          bathroom.floor.toLowerCase().includes(query)
      );
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
  }, [bathrooms, filters, loading]);

  const mapFilteredBathrooms = useMemo(() => {
    if (loading) return [];

    // For map: filter by NAME only (as requested), so markers show only matching names
    if (!filters.query) return bathrooms;
    return bathrooms.filter((b) =>
      b.name.toLowerCase().includes(filters.query.toLowerCase())
    );
  }, [bathrooms, filters.query, loading]);

  const addReview = async (bathroomId: string, reviewData: any) => {
    try {
      await BathroomService.addReview(bathroomId, reviewData);

      // OPTIMIZED: Use single call instead of two separate API calls
      // The addReview method already invalidates cache, so fresh data will be fetched
      const allData = await BathroomService.getAllDataOptimized();

      setBathrooms(allData.bathrooms);
      setStatistics(allData.statistics);
      setRecentReviews(allData.recentReviews);
    } catch (err) {
      console.error("Error adding review:", err);
      throw err;
    }
  };

  const getBathroomById = (id: string) => {
    return bathrooms.find((b) => b.id === id);
  };

  const getBuildings = () => buildings;
  const getFloors = () => floors;

  const updateBathroom = (updatedBathroom: Bathroom) => {
    setBathrooms((prevBathrooms) =>
      prevBathrooms.map((bathroom) =>
        bathroom.id === updatedBathroom.id ? updatedBathroom : bathroom
      )
    );
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    bathrooms: filteredBathrooms,
    mapBathrooms: mapFilteredBathrooms,
    filters,
    updateFilters,
    addReview,
    updateBathroom,
    getBathroomById,
    getBuildings,
    getFloors,
    statistics,
    recentReviews,
    loading,
    error,
  };
}
