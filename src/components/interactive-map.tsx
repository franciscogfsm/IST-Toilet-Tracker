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
          {/* Background Campus Area - Exact IST Alameda Layout */}
          <div className="w-full h-full relative bg-gradient-to-br from-green-100 via-blue-50 to-green-100">
            {/* IST Logo */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full border-4 border-primary shadow-xl flex items-center justify-center z-10">
              <img
                src="/Imagem2.png"
                alt="IST"
                className="w-16 h-16 rounded-full"
              />
            </div>

            {/* Buildings positioned exactly like the real IST map */}

            {/* TOP ROW */}

            {/* Anfiteatro Abreu Faro (very top center) */}
            <div className="absolute top-[5%] left-[45%] w-24 h-8 bg-gray-200 rounded border-2 border-gray-300 shadow-lg">
              <div className="p-0.5 text-[8px] text-gray-800 text-center font-bold">
                ANFITEATRO
                <br />
                ABREU FARO
              </div>
            </div>

            {/* 25 - Pavilhão de Física (top-left) */}
            <div className="absolute top-[12%] left-[8%] w-20 h-16 bg-cyan-200 rounded border-2 border-cyan-300 shadow-lg">
              <div className="p-1 text-[9px] text-cyan-800 text-center font-bold">
                25
                <br />
                FÍSICA
              </div>
            </div>

            {/* 26 - Complexo Interdisciplinar (top-center-left) */}
            <div className="absolute top-[18%] left-[30%] w-24 h-18 bg-purple-200 rounded border-2 border-purple-300 shadow-lg">
              <div className="p-1 text-[8px] text-purple-800 text-center font-bold">
                26
                <br />
                COMPLEXO
                <br />
                INTERDISCIPLINAR
              </div>
            </div>

            {/* 02 - Pavilhão de Civil (top-right, large) */}
            <div className="absolute top-[12%] right-[12%] w-28 h-22 bg-blue-200 rounded border-2 border-blue-300 shadow-lg">
              <div className="p-1 text-[9px] text-blue-800 text-center font-bold">
                02
                <br />
                PAVILHÃO
                <br />
                CIVIL
              </div>
            </div>

            {/* SECOND ROW */}

            {/* 24 - Pavilhão de Matemática (left) */}
            <div className="absolute top-[30%] left-[2%] w-18 h-20 bg-orange-200 rounded border-2 border-orange-300 shadow-lg">
              <div className="p-1 text-[8px] text-orange-800 text-center font-bold">
                24
                <br />
                MATEMÁTICA
              </div>
            </div>

            {/* 05 - Torre Norte (center, tall blue building) */}
            <div className="absolute top-[25%] left-[45%] w-18 h-28 bg-blue-400 rounded border-2 border-blue-500 shadow-xl">
              <div className="p-1 text-[9px] text-white text-center font-bold">
                05
                <br />
                TORRE
                <br />
                NORTE
              </div>
            </div>

            {/* 09 - Pavilhão de Informática I / DEI (right side) */}
            <div className="absolute top-[38%] right-[5%] w-22 h-18 bg-purple-300 rounded border-2 border-purple-400 shadow-xl">
              <div className="p-1 text-[8px] text-purple-800 text-center font-bold">
                09
                <br />
                INFORMÁTICA I<br />
                DEI
              </div>
            </div>

            {/* 03 - Pavilhão do Jardim Norte (right edge) */}
            <div className="absolute top-[42%] right-[28%] w-16 h-14 bg-teal-200 rounded border-2 border-teal-300 shadow-lg">
              <div className="p-0.5 text-[7px] text-teal-800 text-center font-bold">
                03
                <br />
                JARDIM
                <br />
                NORTE
              </div>
            </div>

            {/* CENTRAL ROW */}

            {/* 23 - Infantário (left-center) */}
            <div className="absolute top-[42%] left-[20%] w-16 h-14 bg-pink-200 rounded border-2 border-pink-300 shadow-lg">
              <div className="p-0.5 text-[7px] text-pink-800 text-center font-bold">
                23
                <br />
                INFANTÁRIO
              </div>
            </div>

            {/* 22 - Pavilhão do Jardim Sul (left) */}
            <div className="absolute top-[48%] left-[5%] w-18 h-16 bg-green-200 rounded border-2 border-green-300 shadow-lg">
              <div className="p-0.5 text-[7px] text-green-800 text-center font-bold">
                22
                <br />
                JARDIM SUL
              </div>
            </div>

            {/* 01 - Pavilhão Central (center, main building) */}
            <div className="absolute top-[48%] left-[40%] w-26 h-22 bg-blue-300 rounded border-3 border-blue-400 shadow-xl">
              <div className="p-1 text-[10px] text-blue-800 text-center font-bold">
                01
                <br />
                PAVILHÃO
                <br />
                CENTRAL
              </div>
            </div>

            {/* LOWER SECTION */}

            {/* Row with multiple buildings */}
            {/* 19 - Pavilhão de Minas (left) */}
            <div className="absolute top-[65%] left-[8%] w-16 h-14 bg-amber-200 rounded border-2 border-amber-300 shadow-lg">
              <div className="p-0.5 text-[7px] text-amber-800 text-center font-bold">
                19
                <br />
                MINAS
              </div>
            </div>

            {/* 20 - Torre Sul (center-left, tall blue) */}
            <div className="absolute top-[62%] left-[25%] w-18 h-24 bg-blue-400 rounded border-2 border-blue-500 shadow-xl">
              <div className="p-1 text-[8px] text-white text-center font-bold">
                20
                <br />
                TORRE
                <br />
                SUL
              </div>
            </div>

            {/* 21 - Pavilhão de Química (center) */}
            <div className="absolute top-[65%] left-[45%] w-18 h-16 bg-yellow-200 rounded border-2 border-yellow-300 shadow-lg">
              <div className="p-0.5 text-[7px] text-yellow-800 text-center font-bold">
                21
                <br />
                QUÍMICA
              </div>
            </div>

            {/* 14 - AEIST (center-right) */}
            <div className="absolute top-[68%] right-[18%] w-18 h-14 bg-red-300 rounded border-2 border-red-400 shadow-lg">
              <div className="p-0.5 text-[7px] text-red-800 text-center font-bold">
                14
                <br />
                AEIST
              </div>
            </div>

            {/* 13 - Cantina (right) */}
            <div className="absolute top-[65%] right-[5%] w-16 h-14 bg-orange-300 rounded border-2 border-orange-400 shadow-lg">
              <div className="p-0.5 text-[7px] text-orange-800 text-center font-bold">
                13
                <br />
                CANTINA
              </div>
            </div>

            {/* BOTTOM ROW */}

            {/* 17 - Pavilhão de Ação Social (bottom-left) */}
            <div className="absolute bottom-[12%] left-[5%] w-14 h-12 bg-rose-200 rounded border-2 border-rose-300 shadow-lg">
              <div className="p-0.5 text-[6px] text-rose-800 text-center font-bold">
                17
                <br />
                AÇÃO
                <br />
                SOCIAL
              </div>
            </div>

            {/* Biblioteca Central (bottom-left of center, green) */}
            <div className="absolute bottom-[12%] left-[20%] w-20 h-14 bg-green-300 rounded border-2 border-green-400 shadow-lg">
              <div className="p-0.5 text-[7px] text-green-800 text-center font-bold">
                BIBLIOTECA
                <br />
                CENTRAL
              </div>
            </div>

            {/* 16 - Piscina (bottom-center-left) */}
            <div className="absolute bottom-[15%] left-[42%] w-14 h-12 bg-cyan-300 rounded border-2 border-cyan-400 shadow-lg">
              <div className="p-0.5 text-[6px] text-cyan-800 text-center font-bold">
                16
                <br />
                PISCINA
              </div>
            </div>

            {/* 15 - Campos de Jogos (bottom-center, large green) */}
            <div className="absolute bottom-[8%] left-[58%] w-22 h-16 bg-green-300 rounded border-2 border-green-400 shadow-lg">
              <div className="p-0.5 text-[7px] text-green-800 text-center font-bold">
                15
                <br />
                CAMPOS
                <br />
                JOGOS
              </div>
            </div>

            {/* Green landscaping areas */}
            <div className="absolute top-[28%] left-[55%] w-14 h-12 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute top-[52%] left-[70%] w-12 h-10 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute top-[35%] left-[25%] w-10 h-8 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-[25%] left-[50%] w-16 h-12 bg-green-200 rounded-full opacity-60"></div>

            {/* Campus entrance marker */}
            <div className="absolute bottom-2 left-1/2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center transform -translate-x-1/2 shadow-lg">
              <span className="text-sm font-bold text-yellow-900">🚇</span>
            </div>

            {/* Campus boundary paths */}
            <div className="absolute top-[40%] left-0 w-full h-0.5 bg-gray-300 opacity-40"></div>
            <div className="absolute top-[70%] left-0 w-4/5 h-0.5 bg-gray-300 opacity-40"></div>
            <div className="absolute bottom-8 left-1/2 w-12 h-16 bg-gray-200 transform -translate-x-1/2 opacity-60"></div>
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
