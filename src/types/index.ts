export interface Review {
  id: string;
  bathroom_id?: string; // For database operations
  user_name: string; // Changed from 'user' to match database
  rating: number;
  comment: string;
  date: string;
  cleanliness: number;
  paper_supply: number; // Changed from paperSupply to match database
  privacy: number;
  paper_available?: boolean; // Changed from paperAvailable to match database
  created_at?: string; // Database timestamp
  updated_at?: string; // Database timestamp
}

export interface Bathroom {
  id: string;
  name: string;
  building: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
  floor: string;
  facilities: string[];
  has_accessible?: boolean;
  // Campos calculados dinamicamente baseados nas reviews
  rating?: number; // Calculado da média das reviews
  review_count?: number; // Contagem de reviews
  cleanliness?: string; // Calculado da média das reviews
  paper_supply?: "Bom" | "Médio" | "Fraco"; // Calculado da média das reviews
  paper_availability?: number; // Percentagem de disponibilidade de papel higiênico
  privacy?: "Excelente" | "Boa" | "Média"; // Calculado da média das reviews
  // Campos calculados na aplicação
  distance?: number; // Calculado baseado na localização do usuário
  dynamicDistance?: number; // Distância calculada quando localização está disponível
  reviews?: Review[]; // Reviews carregadas separadamente
  created_at?: string; // Database timestamp
  updated_at?: string; // Database timestamp
}

export interface LocationState {
  userLocation: [number, number] | null;
  isNearIST: boolean;
  locationStatus: "idle" | "requesting" | "enabled" | "denied" | "far";
}

export interface SearchFilters {
  query: string;
  building: string;
  floor: string;
  selectedBathroomId: string;
}

export interface AppSettings {
  showDistanceOffCampus: boolean;
  defaultFloor: string | null;
}

export interface NavigationState {
  activeTab: "map" | "reviews" | "stats";
  showMenu: boolean;
  selectedBathroomDetails: Bathroom | null;
}
