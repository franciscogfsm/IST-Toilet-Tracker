import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  Layers3,
  Filter,
  X,
  User,
  UserCheck,
  Users,
  Accessibility,
} from "lucide-react";
import {
  getUniqueFloors,
  getUniqueBuildings,
  getBathroomsByFloor,
  Bathroom,
} from "@/data/bathrooms";

interface BathroomFiltersProps {
  onFilterChange: (filteredBathrooms: Bathroom[]) => void;
  allBathrooms: Bathroom[];
}

export function BathroomFilters({
  onFilterChange,
  allBathrooms,
}: BathroomFiltersProps) {
  const [selectedFloor, setSelectedFloor] = useState<string | null>("0"); // Default to ground floor
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);

  const floors = getUniqueFloors();
  const buildings = getUniqueBuildings();

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

  const hasActiveFilters =
    selectedFloor || selectedBuilding || showAccessibleOnly;

  // Apply filters whenever any filter changes
  useState(() => {
    applyFilters();
  });

  return (
    <Card className="p-4 bg-background/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Helper text */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
          💡 <strong>Dica:</strong> Use os filtros por piso para evitar
          sobreposição das casas de banho no mapa!
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedFloor("0");
            setTimeout(applyFilters, 0);
          }}
          className="h-6 text-xs"
        >
          🏢 Mostrar só R/C
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="floor"
        className="space-y-2"
      >
        {/* Floor Filter */}
        <AccordionItem value="floor" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Piso</span>
              {selectedFloor && (
                <Badge variant="secondary" className="text-xs">
                  {selectedFloor}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="grid grid-cols-3 gap-2">
              {floors.map((floor) => {
                const count = getBathroomsByFloor(floor).length;
                const isNegative = parseInt(floor) < 0;
                const isGround = floor === "0";
                return (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newFloor = selectedFloor === floor ? null : floor;
                      setSelectedFloor(newFloor);
                      setTimeout(applyFilters, 0);
                    }}
                    className={`h-8 text-xs justify-between ${
                      selectedFloor === floor
                        ? ""
                        : isNegative
                        ? "border-red-200 hover:border-red-300 text-red-700 dark:text-red-400"
                        : isGround
                        ? "border-green-200 hover:border-green-300 text-green-700 dark:text-green-400"
                        : "border-blue-200 hover:border-blue-300 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    <span>{floor === "0" ? "R/C" : floor}</span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-red-600">Caves</span> •{" "}
              <span className="text-green-600">R/C</span> •{" "}
              <span className="text-blue-600">Pisos</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Building Filter */}
        <AccordionItem value="building" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Edifício</span>
              {selectedBuilding && (
                <Badge
                  variant="secondary"
                  className="text-xs max-w-[100px] truncate"
                >
                  {selectedBuilding.split(" ")[0]}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <Select
              value={selectedBuilding || ""}
              onValueChange={(value) => {
                const newBuilding = value === selectedBuilding ? null : value;
                setSelectedBuilding(newBuilding);
                setTimeout(applyFilters, 0);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecionar edifício" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem
                    key={building}
                    value={building}
                    className="text-xs"
                  >
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Accessibility Filter */}
        <AccordionItem value="accessibility" className="border rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Acessibilidade</span>
              {showAccessibleOnly && (
                <Badge variant="secondary" className="text-xs">
                  Ativo
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <Button
              variant={showAccessibleOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowAccessibleOnly(!showAccessibleOnly);
                setTimeout(applyFilters, 0);
              }}
              className="h-8 text-xs w-full justify-start"
            >
              <Accessibility className="h-3 w-3 mr-2" />
              Apenas acessíveis
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Stats */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          {hasActiveFilters
            ? `Mostrando ${
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
              } de ${allBathrooms.length} casas de banho`
            : `${allBathrooms.length} casas de banho disponíveis`}
        </div>
      </div>
    </Card>
  );
}
