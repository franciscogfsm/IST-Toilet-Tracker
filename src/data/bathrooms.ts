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
  floor?: string;
}

export const bathrooms: Bathroom[] = [
  {
    id: "1",
    name: "Casa de banho do Edifício Central",
    building: "Edifício Central - Piso 0",
    distance: 50,
    rating: 4,
    reviewCount: 23,
    cleanliness: "Sempre limpo",
    x: 22,
    y: 35,
    floor: "Piso 0"
  },
  {
    id: "2", 
    name: "Casa de banho do ISEC",
    building: "Edifício do ISEC - Piso 1", 
    distance: 200,
    rating: 4.5,
    reviewCount: 45,
    cleanliness: "Sempre limpo",
    x: 75,
    y: 40,
    floor: "Piso 1"
  },
  {
    id: "3",
    name: "Casa de banho da Biblioteca",
    building: "Biblioteca - Piso 2",
    distance: 150,
    rating: 3.5,
    reviewCount: 18,
    cleanliness: "Geralmente limpo",
    x: 30,
    y: 75,
    floor: "Piso 2"
  },
  {
    id: "4",
    name: "Casa de banho do Edifício da AEIST",
    building: "AEIST - Piso 0",
    distance: 180,
    rating: 4,
    reviewCount: 31,
    cleanliness: "Sempre limpo",
    x: 75,
    y: 80,
    floor: "Piso 0"
  },
  {
    id: "5",
    name: "Casa de banho do Pavilhão de Civil",
    building: "Pavilhão Civil - Piso 1",
    distance: 300,
    rating: 3,
    reviewCount: 12,
    cleanliness: "Às vezes limpo",
    x: 85,
    y: 25,
    floor: "Piso 1"
  }
];