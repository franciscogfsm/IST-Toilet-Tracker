import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BathroomCardProps {
  name: string;
  building: string;
  distance: number;
  rating: number;
  reviewCount: number;
  cleanliness: string;
  isClosest?: boolean;
}

export function BathroomCard({
  name,
  building,
  distance,
  rating,
  reviewCount,
  cleanliness,
  isClosest = false,
}: BathroomCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md cursor-pointer border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">{name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{building}</p>
          </div>
          {isClosest && (
            <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
              Mais próxima
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {distance}m
          </div>
          <span className="text-xs font-medium text-primary">{cleanliness}</span>
        </div>
      </CardContent>
    </Card>
  );
}