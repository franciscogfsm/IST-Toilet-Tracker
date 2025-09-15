import { Star, MapPin, Info, Accessibility, Clock, Users } from "lucide-react";
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
  review_count: number;
  cleanliness: string;
  has_accessible?: boolean;
  paper_supply?: string;
  isClosest?: boolean;
  onViewDetails?: () => void;
  floor?: string;
  last_cleaned?: string;
}

export function BathroomCard({
  name,
  building,
  distance,
  rating,
  review_count,
  cleanliness,
  has_accessible,
  paper_supply,
  isClosest = false,
  onViewDetails,
  floor,
  last_cleaned,
}: BathroomCardProps) {
  return (
    <Card
      className="transition-all duration-200 hover:shadow-lg cursor-pointer border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:scale-[1.01]"
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
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-base leading-tight">
                {name}
              </h3>
              {has_accessible && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <Accessibility className="h-3 w-3 mr-1" />
                        Acessível
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Acessível para pessoas com mobilidade reduzida</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isClosest && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-700"
                >
                  📍 Mais próxima
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {building} {floor && `• ${floor}`}
            </p>
            {last_cleaned && (
              <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                <Clock className="h-3 w-3" />
                Última limpeza: {last_cleaned}
              </div>
            )}
          </div>
          <div className="flex gap-1">
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
                      className="h-8 px-3 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200/60"
                      aria-label="Ver detalhes"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    Ver detalhes e avaliações
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {rating}
          </span>
          <span className="text-sm text-muted-foreground">
            ({review_count})
          </span>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Limpeza
            </div>
            <div
              className={`text-sm font-bold ${
                cleanliness === "Sempre limpo"
                  ? "text-green-600"
                  : cleanliness === "Geralmente limpo"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {cleanliness}
            </div>
          </div>
          {paper_supply && (
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Papel
              </div>
              <div
                className={`text-sm font-bold ${
                  paper_supply === "Bom"
                    ? "text-green-600"
                    : paper_supply === "Médio"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {paper_supply}
              </div>
            </div>
          )}
        </div>

        {/* Distance */}
        {distance !== undefined ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{distance}m de distância</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground/60">
            Distância não disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
