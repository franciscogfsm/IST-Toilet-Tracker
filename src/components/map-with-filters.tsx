import { useState, useEffect } from "react";
import { LeafletMap } from "./leaflet-map";
import { BathroomFilters } from "./bathroom-filters";
import { Bathroom, bathrooms } from "@/data/bathrooms";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MapWithFiltersProps {
  onBathroomSelect: (bathroom: Bathroom | null) => void;
  bathroomData?: Bathroom[];
  isModalOpen?: boolean;
}

export function MapWithFilters({
  onBathroomSelect,
  bathroomData = bathrooms,
  isModalOpen = false,
}: MapWithFiltersProps) {
  const [filteredBathrooms, setFilteredBathrooms] = useState<Bathroom[]>(
    bathroomData.filter((bathroom) => bathroom.floor === "0") // Start with ground floor only (R/C)
  );

  const handleFilterChange = (filtered: Bathroom[]) => {
    setFilteredBathrooms(filtered);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Map */}
      <div className="relative overflow-hidden rounded-xl shadow-lg shadow-black/10 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200/30 dark:ring-gray-700/30">
        <LeafletMap
          onBathroomSelect={onBathroomSelect}
          filteredBathrooms={filteredBathrooms}
          isModalOpen={isModalOpen}
        />
      </div>

      {/* Compact Filters Below Map */}
      <div className="w-full">
        <CompactBathroomFilters
          onFilterChange={handleFilterChange}
          allBathrooms={bathroomData}
        />
      </div>
    </div>
  );
}

// Compact version of filters for below the map
interface CompactBathroomFiltersProps {
  onFilterChange: (filteredBathrooms: Bathroom[]) => void;
  allBathrooms: Bathroom[];
}

function CompactBathroomFilters({
  onFilterChange,
  allBathrooms,
}: CompactBathroomFiltersProps) {
  const [selectedFloor, setSelectedFloor] = useState<string | null>("0"); // Default to ground floor
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);
  const [currentFloorPage, setCurrentFloorPage] = useState(0);

  const allFloors = [
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
  ];

  // Filter floors that have bathrooms
  const availableFloors = allFloors.filter(
    (floor) => allBathrooms.filter((b) => b.floor === floor).length > 0
  );

  const floorsPerPage = 5;
  const totalPages = Math.ceil(availableFloors.length / floorsPerPage);
  const startIndex = currentFloorPage * floorsPerPage;
  const visibleFloors = availableFloors.slice(
    startIndex,
    startIndex + floorsPerPage
  );

  const buildings = [
    "Torre Norte",
    "Pavilhão de Informática I",
    "Pavilhão de Informática II",
    "Pavilhão de Informática III",
    "Pavilhão de Ação Social",
    "Edifício de Minas",
    "Edifício de Civil",
    "Pavilhão de Mecânica I",
    "Pavilhão de Mecânica II",
    "Pavilhão de Mecânica IV",
    "Pavilhão de Química",
    "Técnico Innovation Center",
  ];

  const nextFloorPage = () => {
    if (currentFloorPage < totalPages - 1) {
      setCurrentFloorPage(currentFloorPage + 1);
    }
  };

  const prevFloorPage = () => {
    if (currentFloorPage > 0) {
      setCurrentFloorPage(currentFloorPage - 1);
    }
  };

  const applyFilters = () => {
    let filtered = [...allBathrooms];

    if (selectedFloor) {
      filtered = filtered.filter(
        (bathroom) => bathroom.floor === selectedFloor
      );
    }

    if (selectedBuilding) {
      filtered = filtered.filter(
        (bathroom) => bathroom.building === selectedBuilding
      );
    }

    if (showAccessibleOnly) {
      filtered = filtered.filter((bathroom) => bathroom.accessibility);
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setSelectedFloor(null);
    setSelectedBuilding(null);
    setShowAccessibleOnly(false);
    onFilterChange(allBathrooms);
  };

  // Apply filters whenever any filter OR the base dataset changes
  useEffect(() => {
    applyFilters();
  }, [selectedFloor, selectedBuilding, showAccessibleOnly, allBathrooms]);

  const hasActiveFilters =
    selectedFloor || selectedBuilding || showAccessibleOnly;

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 shadow-md">
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-3">
        {/* Compact Title */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Filtros
          </span>
        </div>

        {/* Compact Mobile Floor Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground/70">
              Piso:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={prevFloorPage}
                disabled={currentFloorPage === 0}
                className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[8px] text-gray-500 px-1">
                {currentFloorPage + 1}/{totalPages}
              </span>
              <button
                onClick={nextFloorPage}
                disabled={currentFloorPage >= totalPages - 1}
                className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {visibleFloors.map((floor) => {
              const count = allBathrooms.filter(
                (b) => b.floor === floor
              ).length;

              const isNegative = parseInt(floor) < 0;
              const isGround = floor === "0";

              return (
                <button
                  key={floor}
                  onClick={() => {
                    const newFloor = selectedFloor === floor ? null : floor;
                    setSelectedFloor(newFloor);
                  }}
                  className={`px-1 py-2 text-[10px] font-medium rounded-lg border transition-all duration-200 active:scale-95 touch-manipulation ${
                    selectedFloor === floor
                      ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                      : isNegative
                      ? "border-red-200 text-red-600 dark:text-red-400 bg-white/90 dark:bg-gray-900/90 hover:bg-red-50 dark:hover:bg-red-950/50"
                      : isGround
                      ? "border-emerald-200 text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-gray-900/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      : "border-blue-200 text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-gray-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold leading-none">
                      {floor === "0" ? "R/C" : floor}
                    </div>
                    <div className="text-[8px] opacity-70 mt-0.5">
                      ({count})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Mobile Building & Accessibility */}
        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={selectedBuilding || ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setSelectedBuilding(value);
              }}
              className="w-full px-2 py-2 text-[10px] font-medium border border-gray-200/60 dark:border-gray-700/60 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none touch-manipulation"
            >
              <option value="">Todos</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building.split(" ")[0]} {building.split(" ")[1] || ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setShowAccessibleOnly(!showAccessibleOnly);
            }}
            className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all duration-200 touch-manipulation min-w-[40px] ${
              showAccessibleOnly
                ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30"
                : "border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/90 hover:bg-green-50 dark:hover:bg-green-950/50"
            }`}
            title={showAccessibleOnly ? "Remover filtro" : "Apenas acessíveis"}
          >
            <span className="text-sm">♿</span>
          </button>
        </div>

        {/* Compact Mobile Clear & Stats */}
        <div className="flex items-center justify-between">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 text-[10px] font-medium rounded-md border border-red-200/60 text-red-600 bg-white/90 dark:bg-gray-900/90 transition-all duration-200 touch-manipulation"
            >
              ✕ Limpar
            </button>
          )}
          <div className="ml-auto">
            <div className="px-2 py-1 bg-blue-50/80 dark:bg-blue-950/40 rounded-md border border-blue-200/30 dark:border-blue-700/30">
              <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300">
                {hasActiveFilters
                  ? `${
                      allBathrooms.filter((bathroom) => {
                        let filtered = [bathroom];
                        if (selectedFloor)
                          filtered = filtered.filter(
                            (b) => b.floor === selectedFloor
                          );
                        if (selectedBuilding)
                          filtered = filtered.filter(
                            (b) => b.building === selectedBuilding
                          );
                        if (showAccessibleOnly)
                          filtered = filtered.filter((b) => b.accessibility);
                        return filtered.length > 0;
                      }).length
                    }/${allBathrooms.length}`
                  : `${allBathrooms.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Filtros
          </span>
        </div>

        {/* Floor Filter - Horizontal buttons with pagination */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground/80">
            Piso:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={prevFloorPage}
              disabled={currentFloorPage === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {visibleFloors.map((floor) => {
                const count = allBathrooms.filter(
                  (b) => b.floor === floor
                ).length;

                const isNegative = parseInt(floor) < 0;
                const isGround = floor === "0";

                return (
                  <button
                    key={floor}
                    onClick={() => {
                      const newFloor = selectedFloor === floor ? null : floor;
                      setSelectedFloor(newFloor);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      selectedFloor === floor
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/25"
                        : isNegative
                        ? "border-red-200/60 hover:border-red-300 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-950/50 dark:hover:to-red-900/50 bg-white/50 dark:bg-gray-900/50"
                        : isGround
                        ? "border-emerald-200/60 hover:border-emerald-300 text-emerald-600 dark:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-950/50 dark:hover:to-emerald-900/50 bg-white/50 dark:bg-gray-900/50"
                        : "border-blue-200/60 hover:border-blue-300 text-blue-600 dark:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-950/50 dark:hover:to-blue-900/50 bg-white/50 dark:bg-gray-900/50"
                    }`}
                  >
                    {floor === "0" ? "R/C" : floor} ({count})
                  </button>
                );
              })}
            </div>
            <button
              onClick={nextFloorPage}
              disabled={currentFloorPage >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {totalPages > 1 && (
              <span className="text-xs text-gray-500 ml-1">
                {currentFloorPage + 1}/{totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Building Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground/80">
            Edifício:
          </span>
          <select
            value={selectedBuilding || ""}
            onChange={(e) => {
              const value = e.target.value || null;
              setSelectedBuilding(value);
            }}
            className="px-3 py-1.5 text-xs font-medium border border-border/60 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
          >
            <option value="">Todos</option>
            {buildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        {/* Accessibility Filter */}
        <button
          onClick={() => {
            setShowAccessibleOnly(!showAccessibleOnly);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md ${
            showAccessibleOnly
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-lg shadow-green-500/25"
              : "border-border/60 hover:border-green-300 bg-white/50 dark:bg-gray-900/50 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/50 dark:hover:to-emerald-900/50"
          }`}
        >
          <span className="flex items-center gap-1">
            <span>♿</span>
            <span>Acessível</span>
          </span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200/60 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/50 dark:hover:to-pink-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md bg-white/50 dark:bg-gray-900/50"
          >
            <span className="flex items-center gap-1">
              <span>✕</span>
              <span>Limpar</span>
            </span>
          </button>
        )}

        {/* Stats */}
        <div className="ml-auto">
          <div className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <span className="text-xs font-medium text-muted-foreground/90">
              {hasActiveFilters
                ? `${
                    allBathrooms.filter((bathroom) => {
                      let filtered = [bathroom];
                      if (selectedFloor)
                        filtered = filtered.filter(
                          (b) => b.floor === selectedFloor
                        );
                      if (selectedBuilding)
                        filtered = filtered.filter(
                          (b) => b.building === selectedBuilding
                        );
                      if (showAccessibleOnly)
                        filtered = filtered.filter((b) => b.accessibility);
                      return filtered.length > 0;
                    }).length
                  }/${allBathrooms.length} casas de banho`
                : `${allBathrooms.length} casas de banho`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
