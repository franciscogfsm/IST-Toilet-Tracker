import { useState } from "react";
import { SearchFilters } from "@/types";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchContainerProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  buildings: string[];
  floors: string[];
}

export function SearchContainer({
  filters,
  onFiltersChange,
  buildings,
  floors,
}: SearchContainerProps) {
  const [localBuilding, setLocalBuilding] = useState(filters.building);
  const [localFloor, setLocalFloor] = useState(filters.floor);

  const handleBuildingChange = (building: string) => {
    setLocalBuilding(building);
    setLocalFloor(""); // Reset floor when building changes
    onFiltersChange({ building, floor: "", selectedBathroomId: "" });
  };

  const handleFloorChange = (floor: string) => {
    setLocalFloor(floor);
    onFiltersChange({ floor, selectedBathroomId: "" });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <SearchInput
        placeholder="Buscar casa de banho..."
        value={filters.query}
        onChange={(e) => onFiltersChange({ query: e.target.value })}
        className="w-full"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={localBuilding} onValueChange={handleBuildingChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os edifícios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os edifícios</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building} value={building}>
                {building}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={localFloor}
          onValueChange={handleFloorChange}
          disabled={!localBuilding}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os pisos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os pisos</SelectItem>
            {floors.map((floor) => (
              <SelectItem key={floor} value={floor}>
                Piso {floor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-500 flex items-center">
          {filters.query && <span>Buscando por: "{filters.query}"</span>}
        </div>
      </div>
    </div>
  );
}
