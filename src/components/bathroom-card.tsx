import { Star, MapPin, Info, Accessibility } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BathroomCardProps {
  id: string;
  name: string;
  building: string;
  distance: number;
  rating: number;
  reviewCount: number;
  cleanliness: string;
  accessibility?: boolean;
  paperSupply?: string;
  isClosest?: boolean;
  onViewDetails?: () => void;
}

export function BathroomCard({
  name,
  building,
  distance,
  rating,
  reviewCount,
  cleanliness,
  accessibility,
  paperSupply,
  isClosest = false,
  onViewDetails,
}: BathroomCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md cursor-pointer border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm">{name}</h3>
              {accessibility && (
                <Accessibility className="h-3 w-3 text-green-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{building}</p>
          </div>
          <div className="flex gap-1">
            {isClosest && (
              <Badge
                variant="secondary"
                className="text-xs bg-accent text-accent-foreground"
              >
                Mais próxima
              </Badge>
            )}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="h-6 px-2 text-xs"
              >
                <Info className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
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
          <div className="flex items-center gap-2">
            {paperSupply && (
              <span
                className={`text-xs font-medium ${
                  paperSupply === "Bom"
                    ? "text-green-600"
                    : paperSupply === "Médio"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                Papel: {paperSupply}
              </span>
            )}
            <span className="text-xs font-medium text-primary">
              {cleanliness}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
