export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  cleanliness: number;
  paperSupply: number;
  privacy: number;
  paperAvailable?: boolean;
}

export interface Bathroom {
  id: string;
  name: string;
  building: string;
  distance: number;
  rating: number;
  reviewCount: number;
  cleanliness: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
  floor: string;
  facilities: string[];
  accessibility: boolean;
  paperSupply: "Bom" | "Médio" | "Fraco";
  privacy: "Excelente" | "Boa" | "Média";
  lastCleaned: string;
  reviews: Review[];
  hasAccessible?: boolean; // For locations that also have accessible facilities
  dynamicDistance?: number; // Calculated distance when user location is available
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
