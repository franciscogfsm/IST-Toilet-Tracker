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
  paperAvailable?: boolean;
  created_at?: string; // Database timestamp
  updated_at?: string; // Database timestamp
}

export interface Bathroom {
  id: string;
  name: string;
  building: string;
  distance: number;
  rating: number;
  review_count: number; // Changed from reviewCount to match database
  cleanliness: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
  floor: string;
  facilities: string[];
  accessibility: boolean;
  paper_supply: "Bom" | "Médio" | "Fraco"; // Changed from paperSupply to match database
  privacy: "Excelente" | "Boa" | "Média";
  last_cleaned: string; // Changed from lastCleaned to match database
  reviews?: Review[]; // Optional, loaded separately
  has_accessible?: boolean; // Changed from hasAccessible to match database
  dynamicDistance?: number; // Calculated distance when user location is available
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
  showReviewForm: boolean;
  selectedBathroomDetails: Bathroom | null;
}
