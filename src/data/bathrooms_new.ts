export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  cleanliness: number;
  paperSupply: number;
  privacy: number;
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
  floor?: string;
  facilities: string[];
  accessibility: boolean;
  paperSupply: "Bom" | "Médio" | "Fraco";
  privacy: "Excelente" | "Boa" | "Média";
  lastCleaned: string;
  reviews: Review[];
}

export const bathrooms: Bathroom[] = [
  {
    id: "1",
    name: "Casa de banho da Torre Norte",
    building: "Torre Norte - Piso 0",
    distance: 50,
    rating: 4,
    reviewCount: 23,
    cleanliness: "Sempre limpo",
    x: 50,
    y: 20,
    floor: "Piso 0",
    facilities: ["Papel higiénico", "Sabão", "Toalhas de papel", "Espelho"],
    accessibility: true,
    paperSupply: "Bom",
    privacy: "Boa",
    lastCleaned: "2 horas atrás",
    reviews: [
      {
        id: "r1",
        user: "João Silva",
        rating: 4,
        comment:
          "Sempre limpo e bem equipado. Boa localização no centro do campus.",
        date: "2024-12-15",
        cleanliness: 4,
        paperSupply: 4,
        privacy: 4,
      },
      {
        id: "r2",
        user: "Maria Santos",
        rating: 5,
        comment: "Excelente! Muito limpo e nunca falta papel.",
        date: "2024-12-14",
        cleanliness: 5,
        paperSupply: 5,
        privacy: 4,
      },
    ],
  },
  {
    id: "2",
    name: "Casa de banho do DEI",
    building: "Departamento de Eng. Informática - Piso 1",
    distance: 200,
    rating: 4.5,
    reviewCount: 45,
    cleanliness: "Sempre limpo",
    x: 75,
    y: 30,
    floor: "Piso 1",
    facilities: [
      "Papel higiénico",
      "Sabão",
      "Toalhas de papel",
      "Espelho",
      "Secador de mãos",
    ],
    accessibility: true,
    paperSupply: "Bom",
    privacy: "Excelente",
    lastCleaned: "1 hora atrás",
    reviews: [
      {
        id: "r3",
        user: "Pedro Costa",
        rating: 5,
        comment: "Top! Muito limpo e moderno. Recomendo!",
        date: "2024-12-15",
        cleanliness: 5,
        paperSupply: 5,
        privacy: 5,
      },
    ],
  },
  {
    id: "3",
    name: "Casa de banho da Biblioteca",
    building: "Biblioteca Central - Piso 1",
    distance: 150,
    rating: 3.5,
    reviewCount: 18,
    cleanliness: "Geralmente limpo",
    x: 22,
    y: 70,
    floor: "Piso 1",
    facilities: ["Papel higiénico", "Sabão", "Espelho"],
    accessibility: false,
    paperSupply: "Médio",
    privacy: "Média",
    lastCleaned: "4 horas atrás",
    reviews: [
      {
        id: "r4",
        user: "Ana Ferreira",
        rating: 3,
        comment: "Ok, mas às vezes falta papel higiénico.",
        date: "2024-12-13",
        cleanliness: 4,
        paperSupply: 2,
        privacy: 3,
      },
    ],
  },
  {
    id: "4",
    name: "Casa de banho do Pavilhão Central",
    building: "Pavilhão Central - Piso 0",
    distance: 80,
    rating: 4.2,
    reviewCount: 31,
    cleanliness: "Sempre limpo",
    x: 50,
    y: 50,
    floor: "Piso 0",
    facilities: ["Papel higiénico", "Sabão", "Toalhas de papel", "Espelho"],
    accessibility: true,
    paperSupply: "Bom",
    privacy: "Boa",
    lastCleaned: "2 horas atrás",
    reviews: [
      {
        id: "r5",
        user: "Rui Oliveira",
        rating: 4,
        comment: "Bom estado geral, limpo e funcional.",
        date: "2024-12-14",
        cleanliness: 4,
        paperSupply: 4,
        privacy: 4,
      },
    ],
  },
  {
    id: "5",
    name: "Casa de banho da Torre Sul",
    building: "Torre Sul - Piso 1",
    distance: 300,
    rating: 3,
    reviewCount: 12,
    cleanliness: "Às vezes limpo",
    x: 50,
    y: 80,
    floor: "Piso 1",
    facilities: ["Papel higiénico", "Sabão"],
    accessibility: false,
    paperSupply: "Fraco",
    privacy: "Média",
    lastCleaned: "6 horas atrás",
    reviews: [
      {
        id: "r6",
        user: "Carlos Mendes",
        rating: 2,
        comment: "Precisa de mais manutenção. Frequentemente sem papel.",
        date: "2024-12-12",
        cleanliness: 2,
        paperSupply: 1,
        privacy: 3,
      },
    ],
  },
];
