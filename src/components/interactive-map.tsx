import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon as LeafletIcon } from "leaflet";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// IST Campus coordinates (Alameda)
const IST_CENTER: [number, number] = [38.7372, -9.1392];

interface BathroomLocation {
  id: string;
  name: string;
  building: string;
  position: [number, number];
  rating: number;
  reviewCount: number;
  cleanliness: string;
}

// Real IST bathroom locations (approximate coordinates)
const istBathrooms: BathroomLocation[] = [
  {
    id: "1",
    name: "Casa de banho do Edifício Central",
    building: "Edifício Central - Piso 0",
    position: [38.7372, -9.1392],
    rating: 4,
    reviewCount: 23,
    cleanliness: "Sempre limpo"
  },
  {
    id: "2",
    name: "Casa de banho do ISEC",
    building: "Edifício do ISEC - Piso 1",
    position: [38.7375, -9.1385],
    rating: 4.5,
    reviewCount: 45,
    cleanliness: "Sempre limpo"
  },
  {
    id: "3",
    name: "Casa de banho da Biblioteca",
    building: "Biblioteca - Piso 2",
    position: [38.7368, -9.1398],
    rating: 3.5,
    reviewCount: 18,
    cleanliness: "Geralmente limpo"
  },
  {
    id: "4",
    name: "Casa de banho do Pavilhão Civil",
    building: "Pavilhão Civil - Piso 1",
    position: [38.7378, -9.1388],
    rating: 3,
    reviewCount: 12,
    cleanliness: "Às vezes limpo"
  },
  {
    id: "5",
    name: "Casa de banho do DEI",
    building: "Departamento de Eng. Informática",
    position: [38.7370, -9.1395],
    rating: 4.2,
    reviewCount: 31,
    cleanliness: "Sempre limpo"
  }
];

// Custom toilet icon
const createBathroomIcon = (rating: number) => {
  const color = rating >= 4 ? "#1565C0" : rating >= 3.5 ? "#FFA726" : "#F44336";
  
  return new LeafletIcon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <g transform="translate(8, 8)" fill="white">
          <path d="M8 2C8.55 2 9 2.45 9 3S8.55 4 8 4 7 3.55 7 3 7.45 2 8 2M9.5 7L8.5 14H7.5L6.5 7H9.5M6 5.5V7H10V5.5H6Z"/>
        </g>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface InteractiveMapProps {
  onBathroomSelect?: (bathroom: BathroomLocation) => void;
}

export function InteractiveMap({ onBathroomSelect }: InteractiveMapProps) {
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);

  return (
    <Card className="w-full h-96 overflow-hidden border-border/50">
      <MapContainer
        center={IST_CENTER}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {istBathrooms.map((bathroom) => (
          <Marker
            key={bathroom.id}
            position={bathroom.position}
            icon={createBathroomIcon(bathroom.rating)}
            eventHandlers={{
              click: () => {
                setSelectedBathroom(bathroom.id);
                onBathroomSelect?.(bathroom);
              }
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-2">{bathroom.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{bathroom.building}</p>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < bathroom.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">({bathroom.reviewCount})</span>
                </div>
                
                <p className="text-xs font-medium text-primary mb-2">{bathroom.cleanliness}</p>
                
                <Button size="sm" className="w-full text-xs">
                  Ver detalhes
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}