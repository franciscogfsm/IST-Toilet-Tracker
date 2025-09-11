import { Bathroom } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

interface BathroomCardProps {
  bathroom: Bathroom;
  distance?: number;
  isClosest?: boolean;
  onViewDetails?: () => void;
  compact?: boolean;
}

export function BathroomCard({
  bathroom,
  distance,
  isClosest = false,
  onViewDetails,
  compact = false,
}: BathroomCardProps) {
  const displayDistance = distance ?? bathroom.distance;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isClosest ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      }`}
      onClick={onViewDetails}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {bathroom.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {bathroom.building} • Piso {bathroom.floor}
            </p>
          </div>
          {isClosest && (
            <Badge variant="secondary" className="ml-2">
              <MapPin className="h-3 w-3 mr-1" />
              Mais próximo
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{bathroom.rating}</span>
            <span className="text-sm text-gray-500">
              ({bathroom.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            {displayDistance}m
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{bathroom.cleanliness}</span>
          <span>{bathroom.paperSupply}</span>
          <span>{bathroom.privacy}</span>
        </div>

        {!compact && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Última limpeza: {bathroom.lastCleaned}</span>
          </div>
        )}

        {bathroom.accessibility && (
          <Badge variant="outline" className="mt-2 text-xs">
            ♿ Acessível
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
