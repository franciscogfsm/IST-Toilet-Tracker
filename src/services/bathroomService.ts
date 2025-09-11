import { Bathroom, Review } from "@/types";

export class BathroomService {
  private static instance: BathroomService;
  private bathrooms: Bathroom[] = [];

  private constructor() {
    // Initialize with static data - in a real app, this would come from an API
    this.loadBathrooms();
  }

  static getInstance(): BathroomService {
    if (!BathroomService.instance) {
      BathroomService.instance = new BathroomService();
    }
    return BathroomService.instance;
  }

  private async loadBathrooms() {
    // In a real app, this would be an API call
    const { bathrooms } = await import("@/data/bathrooms");
    this.bathrooms = bathrooms;
  }

  getAllBathrooms(): Bathroom[] {
    return this.bathrooms;
  }

  getBathroomById(id: string): Bathroom | undefined {
    return this.bathrooms.find((b) => b.id === id);
  }

  getBathroomsByBuilding(building: string): Bathroom[] {
    return this.bathrooms.filter((b) => b.building === building);
  }

  getBathroomsByFloor(floor: string): Bathroom[] {
    return this.bathrooms.filter((b) => b.floor === floor);
  }

  searchBathrooms(query: string): Bathroom[] {
    const lowercaseQuery = query.toLowerCase();
    return this.bathrooms.filter(
      (bathroom) =>
        bathroom.name.toLowerCase().includes(lowercaseQuery) ||
        bathroom.building.toLowerCase().includes(lowercaseQuery)
    );
  }

  getUniqueBuildings(): string[] {
    const buildings = this.bathrooms.map((b) => b.building);
    return [...new Set(buildings)].sort();
  }

  getUniqueFloors(): string[] {
    const floors = this.bathrooms.map((b) => b.floor);
    return [...new Set(floors)].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  }

  addReview(bathroomId: string, review: Omit<Review, "id" | "date">): void {
    const bathroom = this.getBathroomById(bathroomId);
    if (!bathroom) return;

    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };

    bathroom.reviews.push(newReview);
    this.updateBathroomStats(bathroom);
  }

  private updateBathroomStats(bathroom: Bathroom): void {
    const reviews = bathroom.reviews;
    if (reviews.length === 0) return;

    // Update review count
    bathroom.reviewCount = reviews.length;

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    bathroom.rating = Math.round((totalRating / reviews.length) * 10) / 10;

    // Update aggregated stats
    const avgClean =
      reviews.reduce((s, r) => s + (r.cleanliness || 0), 0) / reviews.length;
    const avgPaper =
      reviews.reduce((s, r) => s + (r.paperSupply || 0), 0) / reviews.length;
    const avgPrivacy =
      reviews.reduce((s, r) => s + (r.privacy || 0), 0) / reviews.length;

    bathroom.cleanliness = this.getCleanlinessLabel(avgClean);
    bathroom.paperSupply = this.getPaperSupplyLabel(avgPaper);
    bathroom.privacy = this.getPrivacyLabel(avgPrivacy);
  }

  private getCleanlinessLabel(avg: number): string {
    if (avg >= 4.5) return "Sempre limpo";
    if (avg >= 3.5) return "Geralmente limpo";
    return "Às vezes limpo";
  }

  private getPaperSupplyLabel(avg: number): "Bom" | "Médio" | "Fraco" {
    if (avg >= 4.5) return "Bom";
    if (avg >= 3.0) return "Médio";
    return "Fraco";
  }

  private getPrivacyLabel(avg: number): "Excelente" | "Boa" | "Média" {
    if (avg >= 4.5) return "Excelente";
    if (avg >= 3.5) return "Boa";
    return "Média";
  }
}
