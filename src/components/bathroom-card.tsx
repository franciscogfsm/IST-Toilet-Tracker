import { Star, MapPin, Info, Accessibility } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BathroomCardProps {
  id: string;
  name: string;
  building: string;
  distance?: number; // optional: only show when near IST
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
    <Card
      className="transition-all duration-200 hover:shadow-md cursor-pointer border-border/50 bg-white/70 dark:bg-gray-900/70"
      onClick={onViewDetails}
      role={onViewDetails ? "button" : undefined}
      tabIndex={onViewDetails ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onViewDetails) {
          e.preventDefault();
          onViewDetails();
        }
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {name}
              </h3>
              {accessibility && (
                <Accessibility className="h-3 w-3 text-green-600" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mb-1.5">
              {building}
            </p>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails();
                      }}
                      className="h-7 px-2.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200/60"
                      aria-label="Ver detalhes"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline ml-1">Detalhes</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    Ver detalhes
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
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
          <span className="text-[11px] text-muted-foreground">
            ({reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between">
          {distance !== undefined ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {distance}m
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/60">&nbsp;</span>
          )}
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
