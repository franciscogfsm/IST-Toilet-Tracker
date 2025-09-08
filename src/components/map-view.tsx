import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BathroomLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  rating: number;
}

interface MapViewProps {
  bathrooms: BathroomLocation[];
  onBathroomSelect?: (bathroom: BathroomLocation) => void;
}

export function MapView({ bathrooms, onBathroomSelect }: MapViewProps) {
  return (
    <Card className="relative w-full h-80 overflow-hidden bg-gradient-to-br from-accent/20 to-secondary/30 border-border/50">
      {/* Simplified IST Campus Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10">
        {/* Building representations */}
        <div className="absolute top-16 left-12 w-20 h-16 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center">Edifício Central</div>
        </div>
        <div className="absolute top-20 right-16 w-16 h-12 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center">ISEC</div>
        </div>
        <div className="absolute bottom-20 left-20 w-18 h-14 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center">Biblioteca</div>
        </div>
        <div className="absolute bottom-16 right-12 w-16 h-16 bg-muted/40 rounded-lg border border-border/30">
          <div className="p-2 text-xs text-muted-foreground text-center">AEIST</div>
        </div>
      </div>
      
      {/* Bathroom Pins */}
      {bathrooms.map((bathroom) => (
        <button
          key={bathroom.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none"
          style={{ 
            left: `${bathroom.x}%`, 
            top: `${bathroom.y}%` 
          }}
          onClick={() => onBathroomSelect?.(bathroom)}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background">
              <MapPin className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            {bathroom.rating >= 4 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-background"></div>
            )}
          </div>
        </button>
      ))}
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-md border border-border/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <MapPin className="h-2 w-2 text-primary-foreground fill-current" />
          </div>
          <span className="text-muted-foreground">Casa de banho</span>
        </div>
      </div>
    </Card>
  );
}