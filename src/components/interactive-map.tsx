import { useState } from "react";
import { MapPin, Star, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BathroomLocation {
  id: string;
  name: string;
  building: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
  rating: number;
  reviewCount: number;
  cleanliness: string;
  distance: number;
}

// IST bathroom locations on campus map
const istBathrooms: BathroomLocation[] = [
  {
    id: "1",
    name: "Casa de banho do Edifício Central",
    building: "Edifício Central - Piso 0",
    x: 45,
    y: 50,
    rating: 4,
    reviewCount: 23,
    cleanliness: "Sempre limpo",
    distance: 50
  },
  {
    id: "2",
    name: "Casa de banho do ISEC",
    building: "Edifício do ISEC - Piso 1",
    x: 75,
    y: 35,
    rating: 4.5,
    reviewCount: 45,
    cleanliness: "Sempre limpo",
    distance: 200
  },
  {
    id: "3",
    name: "Casa de banho da Biblioteca",
    building: "Biblioteca - Piso 2",
    x: 25,
    y: 70,
    rating: 3.5,
    reviewCount: 18,
    cleanliness: "Geralmente limpo",
    distance: 150
  },
  {
    id: "4",
    name: "Casa de banho do Pavilhão Civil",
    building: "Pavilhão Civil - Piso 1",
    x: 80,
    y: 65,
    rating: 3,
    reviewCount: 12,
    cleanliness: "Às vezes limpo",
    distance: 300
  },
  {
    id: "5",
    name: "Casa de banho do DEI",
    building: "Departamento de Eng. Informática",
    x: 60,
    y: 40,
    rating: 4.2,
    reviewCount: 31,
    cleanliness: "Sempre limpo",
    distance: 120
  }
];

interface InteractiveMapProps {
  onBathroomSelect?: (bathroom: BathroomLocation) => void;
}

export function InteractiveMap({ onBathroomSelect }: InteractiveMapProps) {
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);
  const [hoveredBathroom, setHoveredBathroom] = useState<string | null>(null);

  const handleBathroomClick = (bathroom: BathroomLocation) => {
    setSelectedBathroom(bathroom.id);
    onBathroomSelect?.(bathroom);
  };

  const getBathroomColor = (rating: number) => {
    if (rating >= 4) return "bg-primary";
    if (rating >= 3.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="relative w-full h-96 overflow-hidden border-border/50 bg-gradient-to-br from-accent/20 to-secondary/30">
      {/* Campus Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10">
        {/* Building representations */}
        <div className="absolute top-12 left-16 w-24 h-20 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center font-medium">
            Edifício<br />Central
          </div>
        </div>
        
        <div className="absolute top-8 right-12 w-20 h-16 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center font-medium">
            ISEC
          </div>
        </div>
        
        <div className="absolute bottom-16 left-8 w-22 h-18 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center font-medium">
            Biblioteca
          </div>
        </div>
        
        <div className="absolute bottom-12 right-8 w-20 h-20 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center font-medium">
            Pavilhão<br />Civil
          </div>
        </div>

        <div className="absolute top-16 left-1/2 w-18 h-16 bg-muted/40 rounded-lg border border-border/30 transform -translate-x-1/2">
          <div className="p-2 text-xs text-muted-foreground text-center font-medium">
            DEI
          </div>
        </div>
      </div>

      {/* Bathroom Pins */}
      {istBathrooms.map((bathroom) => (
        <div
          key={bathroom.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ 
            left: `${bathroom.x}%`, 
            top: `${bathroom.y}%` 
          }}
        >
          <button
            className={`relative transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none ${
              selectedBathroom === bathroom.id ? 'scale-125' : ''
            }`}
            onClick={() => handleBathroomClick(bathroom)}
            onMouseEnter={() => setHoveredBathroom(bathroom.id)}
            onMouseLeave={() => setHoveredBathroom(null)}
          >
            <div className={`w-8 h-8 ${getBathroomColor(bathroom.rating)} rounded-full flex items-center justify-center shadow-lg border-2 border-background`}>
              <MapPin className="h-4 w-4 text-white fill-current" />
            </div>
            
            {/* Rating indicator */}
            {bathroom.rating >= 4 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-background"></div>
            )}

            {/* Hover tooltip */}
            {hoveredBathroom === bathroom.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{bathroom.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{bathroom.building}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < bathroom.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({bathroom.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {bathroom.distance}m
                    </Badge>
                    <span className="text-xs font-medium text-primary">{bathroom.cleanliness}</span>
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>
      ))}

      {/* Selected bathroom details */}
      {selectedBathroom && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          {(() => {
            const bathroom = istBathrooms.find(b => b.id === selectedBathroom);
            if (!bathroom) return null;
            
            return (
              <Card className="bg-background/95 backdrop-blur-sm border-border/50">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{bathroom.name}</h3>
                      <p className="text-xs text-muted-foreground">{bathroom.building}</p>
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
                            i < bathroom.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({bathroom.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      {bathroom.distance}m
                    </div>
                    <span className="text-xs font-medium text-primary">{bathroom.cleanliness}</span>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="h-2 w-2 text-white fill-current" />
            </div>
            <span className="text-muted-foreground">Excelente (4+★)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <MapPin className="h-2 w-2 text-white fill-current" />
            </div>
            <span className="text-muted-foreground">Bom (3.5+★)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <MapPin className="h-2 w-2 text-white fill-current" />
            </div>
            <span className="text-muted-foreground">Básico (&lt;3.5★)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}