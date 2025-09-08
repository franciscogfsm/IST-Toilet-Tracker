import { useState, useRef } from "react";
import {
  MapPin,
  Star,
  Navigation,
  Accessibility,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bathrooms, Bathroom } from "@/data/bathrooms";

interface InteractiveMapProps {
  onBathroomSelect?: (bathroom: Bathroom) => void;
}

export function InteractiveMap({ onBathroomSelect }: InteractiveMapProps) {
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);
  const [hoveredBathroom, setHoveredBathroom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleBathroomClick = (bathroom: Bathroom) => {
    setSelectedBathroom(bathroom.id);
    onBathroomSelect?.(bathroom);
  };

  const getBathroomColor = (rating: number) => {
    if (rating >= 4) return "bg-primary";
    if (rating >= 3.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.3, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  };

  return (
    <Card className="relative w-full h-[600px] overflow-hidden border-border/50 bg-gradient-to-br from-blue-50 to-green-50 select-none">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Interactive Map Container */}
      <div
        ref={mapRef}
        className="absolute inset-0"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Campus Map - Based on real IST Alameda layout */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Background Campus Area */}
          <div className="w-full h-full relative bg-gradient-to-br from-green-100 via-blue-50 to-green-100">
            {/* Campus outline and main paths */}
            <div className="absolute inset-0 border-8 border-gray-300 rounded-3xl bg-green-50/30"></div>

            {/* Main campus roads based on real layout */}
            <div className="absolute bottom-0 left-1/2 w-12 h-24 bg-gray-300 transform -translate-x-1/2 rounded-t-lg"></div>
            <div className="absolute top-1/3 left-0 w-full h-3 bg-gray-200 opacity-60"></div>
            <div className="absolute top-2/3 left-0 w-full h-2 bg-gray-200 opacity-60"></div>
            <div className="absolute top-0 left-1/4 w-2 h-full bg-gray-200 opacity-60"></div>
            <div className="absolute top-0 right-1/4 w-2 h-full bg-gray-200 opacity-60"></div>

            {/* IST Buildings based on real campus map */}

            {/* 01 - Pavilhão Central */}
            <div className="absolute top-[45%] left-[48%] w-24 h-18 bg-blue-300 rounded-lg border-2 border-blue-400 shadow-xl transform -translate-x-1/2 -translate-y-1/2">
              <div className="p-1 text-[10px] text-blue-800 text-center font-bold">
                01
                <br />
                PAVILHÃO
                <br />
                CENTRAL
              </div>
            </div>

            {/* 02 - Pavilhão de Civil */}
            <div className="absolute top-[25%] right-[20%] w-28 h-22 bg-cyan-300 rounded-lg border-2 border-cyan-400 shadow-xl">
              <div className="p-1 text-[10px] text-cyan-800 text-center font-bold">
                02
                <br />
                PAVILHÃO
                <br />
                CIVIL
              </div>
            </div>

            {/* 05 - Torre Norte */}
            <div className="absolute top-[15%] left-[48%] w-20 h-32 bg-blue-400 rounded-lg border-2 border-blue-500 shadow-xl transform -translate-x-1/2">
              <div className="p-1 text-[9px] text-white text-center font-bold">
                05
                <br />
                TORRE
                <br />
                NORTE
              </div>
            </div>

            {/* 09 - Pavilhão de Informática I (DEI) */}
            <div className="absolute top-[35%] right-[12%] w-26 h-20 bg-purple-300 rounded-lg border-2 border-purple-400 shadow-xl">
              <div className="p-1 text-[9px] text-purple-800 text-center font-bold">
                09
                <br />
                INFORMÁTICA I<br />
                DEI
              </div>
            </div>

            {/* 14 - Pavilhão da Associação de Estudantes */}
            <div className="absolute bottom-[25%] left-[12%] w-20 h-18 bg-red-300 rounded-lg border-2 border-red-400 shadow-xl">
              <div className="p-1 text-[9px] text-red-800 text-center font-bold">
                14
                <br />
                AEIST
              </div>
            </div>

            {/* 20 - Torre Sul */}
            <div className="absolute bottom-[20%] left-[48%] w-20 h-28 bg-blue-400 rounded-lg border-2 border-blue-500 shadow-xl transform -translate-x-1/2">
              <div className="p-1 text-[9px] text-white text-center font-bold">
                20
                <br />
                TORRE
                <br />
                SUL
              </div>
            </div>

            {/* Biblioteca Central */}
            <div className="absolute top-[65%] left-[25%] w-24 h-18 bg-green-300 rounded-lg border-2 border-green-400 shadow-xl">
              <div className="p-1 text-[9px] text-green-800 text-center font-bold">
                BIBLIOTECA
                <br />
                CENTRAL
              </div>
            </div>

            {/* Campus green areas and gardens */}
            <div className="absolute top-[20%] left-[15%] w-16 h-12 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-[35%] right-[30%] w-20 h-16 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute top-[55%] right-[35%] w-14 h-14 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute top-[40%] left-[25%] w-12 h-8 bg-green-200 rounded-full opacity-60"></div>

            {/* IST Logo */}
            <div className="absolute top-6 left-6 w-24 h-24 bg-white rounded-full border-4 border-primary shadow-2xl flex items-center justify-center">
              <img
                src="/Imagem2.png"
                alt="IST"
                className="w-20 h-20 rounded-full"
              />
            </div>

            {/* Campus entrance */}
            <div className="absolute bottom-2 left-1/2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center transform -translate-x-1/2">
              <span className="text-xs font-bold text-yellow-900">🚇</span>
            </div>
          </div>

          {/* Bathroom Pins */}
          {bathrooms.map((bathroom) => (
            <div
              key={bathroom.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${bathroom.x}%`,
                top: `${bathroom.y}%`,
              }}
            >
              <button
                className={`relative transition-all duration-200 hover:scale-125 focus:scale-125 focus:outline-none ${
                  selectedBathroom === bathroom.id ? "scale-140" : ""
                }`}
                onClick={() => handleBathroomClick(bathroom)}
                onMouseEnter={() => setHoveredBathroom(bathroom.id)}
                onMouseLeave={() => setHoveredBathroom(null)}
              >
                <div
                  className={`w-10 h-10 ${getBathroomColor(
                    bathroom.rating
                  )} rounded-full flex items-center justify-center shadow-lg border-3 border-white hover:shadow-xl`}
                >
                  <MapPin className="h-5 w-5 text-white fill-current" />
                </div>

                {/* Rating indicator */}
                {bathroom.rating >= 4 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Star className="h-2 w-2 text-yellow-900 fill-current" />
                  </div>
                )}

                {/* Accessibility indicator */}
                {bathroom.accessibility && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Accessibility className="h-2 w-2 text-white" />
                  </div>
                )}

                {/* Enhanced Hover tooltip */}
                {hoveredBathroom === bathroom.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-30">
                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[240px]">
                      <h3 className="font-semibold text-sm mb-1">
                        {bathroom.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {bathroom.building}
                      </p>

                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < bathroom.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({bathroom.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {bathroom.distance}m
                        </Badge>
                        <span className="text-xs font-medium text-primary">
                          {bathroom.cleanliness}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`font-medium ${
                            bathroom.paperSupply === "Bom"
                              ? "text-green-600"
                              : bathroom.paperSupply === "Médio"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          Papel: {bathroom.paperSupply}
                        </span>
                        {bathroom.accessibility && (
                          <span className="text-green-600 flex items-center gap-1">
                            <Accessibility className="h-3 w-3" />
                            Acessível
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected bathroom details */}
      {selectedBathroom && (
        <div className="absolute bottom-4 left-4 right-4 z-25">
          {(() => {
            const bathroom = bathrooms.find((b) => b.id === selectedBathroom);
            if (!bathroom) return null;

            return (
              <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-xl">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">
                        {bathroom.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {bathroom.building}
                      </p>
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
                            i < bathroom.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({bathroom.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      {bathroom.distance}m
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {bathroom.cleanliness}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-medium ${
                          bathroom.paperSupply === "Bom"
                            ? "text-green-600"
                            : bathroom.paperSupply === "Médio"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        Papel: {bathroom.paperSupply}
                      </span>
                      <span className="text-muted-foreground">
                        Privacidade: {bathroom.privacy}
                      </span>
                    </div>
                    {bathroom.accessibility && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Accessibility className="h-3 w-3" />
                        Acessível
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Map Legend and Info */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border/50 z-30">
        <div className="space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">
            Legenda
          </div>
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
          <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/50">
            <Accessibility className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Acessível</span>
          </div>
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded px-3 py-1 text-xs z-30">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-center z-30">
        🖱️ Arraste para mover • 🖲️ Scroll para zoom • 📍 Clique nos pinos
      </div>
    </Card>
  );
}
