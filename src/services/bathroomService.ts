import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import { DeviceFingerprint } from "@/lib/deviceFingerprint";

type Bathroom = Database["public"]["Tables"]["bathrooms"]["Row"];
type BathroomInsert = Database["public"]["Tables"]["bathrooms"]["Insert"];
type BathroomUpdate = Database["public"]["Tables"]["bathrooms"]["Update"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

export class BathroomService {
  // Cache for reducing API calls
  private static _cache = {
    bathrooms: null as any[] | null,
    lastFetch: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  };

  // Method to invalidate cache when data changes
  static invalidateCache() {
    this._cache.bathrooms = null;
    this._cache.lastFetch = 0;
  }

  // Combined API call that gets all data in one request
  static async getAllDataOptimized() {
    const now = Date.now();

    // Return cached data if still fresh
    if (
      this._cache.bathrooms &&
      now - this._cache.lastFetch < this._cache.CACHE_DURATION
    ) {
      return this.processAllData(this._cache.bathrooms);
    }

    // Fetch fresh data
    const { data: bathrooms, error: bathroomsError } = await supabase.from(
      "bathrooms"
    ).select(`
        *,
        reviews (*)
      `);

    if (bathroomsError) {
      console.error("Error fetching bathrooms:", bathroomsError);
      throw bathroomsError;
    }

    const { data: recentReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        *,
        bathrooms (
          id,
          name,
          building,
          floor
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (reviewsError) {
      console.error("Error fetching recent reviews:", reviewsError);
      throw reviewsError;
    }

    // Update cache
    this._cache.bathrooms = bathrooms || [];
    this._cache.lastFetch = now;

    return this.processAllData(bathrooms || [], recentReviews || []);
  }

  // Helper method to get most common cleanliness
  static getMostCommonCleanliness(reviews: any[]): string {
    if (reviews.length === 0) return "N/A";

    const cleanlinessCounts = reviews.reduce((acc, review) => {
      const level = this.getCleanlinessLabel(review.cleanliness);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(cleanlinessCounts).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];
    return mostCommon ? mostCommon[0] : "N/A";
  }

  // Process all data from bathrooms to derive everything else
  static processAllData(bathrooms: any[], recentReviews: any[] = []) {
    // Process bathrooms with calculated fields
    const processedBathrooms = bathrooms.map((bathroom) => {
      const reviews = bathroom.reviews || [];

      if (reviews.length === 0) {
        return {
          ...bathroom,
          rating: undefined,
          review_count: 0,
          cleanliness: undefined,
          paper_supply: undefined,
          paper_availability: undefined,
          privacy: undefined,
        };
      }

      // Calculate average rating
      const avgRating =
        reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length;

      const reviewCount = reviews.length;

      // Calculate average cleanliness
      const avgCleanliness =
        reviews.reduce((sum: number, r: any) => sum + r.cleanliness, 0) /
        reviews.length;
      const cleanlinessLabel = this.getCleanlinessLabel(avgCleanliness);

      // Calculate paper supply percentage
      const paperAvailableCount = reviews.filter(
        (r: any) => r.paper_available
      ).length;
      const paperSupplyPercentage =
        (paperAvailableCount / reviews.length) * 100;
      const paperSupplyLabel = this.getPaperSupplyLabel(paperSupplyPercentage);

      // Calculate privacy average
      const avgPrivacy =
        reviews.reduce((sum: number, r: any) => sum + r.privacy, 0) /
        reviews.length;

      return {
        ...bathroom,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        cleanliness: cleanlinessLabel,
        paper_supply: paperSupplyLabel,
        paper_availability: paperSupplyPercentage,
        privacy: Math.round(avgPrivacy * 10) / 10,
      };
    });

    // Sort by rating
    const sortedBathrooms = processedBathrooms.sort((a, b) => {
      if (a.rating === undefined && b.rating === undefined) return 0;
      if (a.rating === undefined) return 1;
      if (b.rating === undefined) return -1;
      return b.rating - a.rating;
    });

    // Derive unique buildings and floors
    const buildings = [...new Set(bathrooms.map((b) => b.building))].sort();
    const floors = [...new Set(bathrooms.map((b) => b.floor))].sort();

    // Calculate statistics
    const allReviews = bathrooms.flatMap((b) => b.reviews || []);
    const stats = {
      totalReviews: allReviews.length,
      avgRating:
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0,
      buildingsCount: buildings.length,
      mostCommonCleanliness: this.getMostCommonCleanliness(allReviews),
    };

    return {
      bathrooms: sortedBathrooms,
      buildings,
      floors,
      statistics: stats,
      recentReviews,
    };
  }

  static async getAllBathrooms() {
    const { data, error } = await supabase.from("bathrooms").select(
      `
        *,
        reviews (*)
      `
    );

    if (error) {
      console.error("Error fetching bathrooms:", error);
      throw error;
    }

    // Calcular campos dinamicamente para cada banheiro
    const bathroomsWithCalculatedFields = (data || []).map((bathroom) => {
      const reviews = bathroom.reviews || [];

      if (reviews.length === 0) {
        return {
          ...bathroom,
          rating: undefined,
          review_count: 0,
          cleanliness: undefined,
          paper_supply: undefined,
          paper_availability: undefined,
          privacy: undefined,
        };
      }

      // Calcular rating médio
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      // Calcular review_count
      const reviewCount = reviews.length;

      // Calcular cleanliness médio
      const avgCleanliness =
        reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length;
      const cleanlinessLabel = this.getCleanlinessLabel(avgCleanliness);

      // Calcular paper_supply médio
      const avgPaperSupply =
        reviews.reduce((sum, r) => sum + r.paper_supply, 0) / reviews.length;
      const paperSupplyLabel = this.getPaperSupplyLabel(avgPaperSupply);

      // Calcular paper availability percentage
      const availableReviews = reviews.filter(
        (r) => r.paper_available === true
      ).length;
      const paperAvailabilityPercent =
        reviews.length > 0
          ? Math.round((availableReviews / reviews.length) * 100)
          : 0;

      // Calcular privacy médio
      const avgPrivacy =
        reviews.reduce((sum, r) => sum + r.privacy, 0) / reviews.length;
      const privacyLabel = this.getPrivacyLabel(avgPrivacy);

      return {
        ...bathroom,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        cleanliness: cleanlinessLabel,
        paper_supply: paperSupplyLabel,
        paper_availability: paperAvailabilityPercent,
        privacy: privacyLabel,
      };
    });

    // Ordenar por rating (banheiros sem reviews ficam por último)
    return bathroomsWithCalculatedFields.sort((a, b) => {
      if (a.rating === undefined && b.rating === undefined) return 0;
      if (a.rating === undefined) return 1;
      if (b.rating === undefined) return -1;
      return b.rating - a.rating;
    });
  }

  static async getBathroomById(id: string) {
    const { data, error } = await supabase
      .from("bathrooms")
      .select(
        `
        *,
        reviews (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching bathroom:", error);
      throw error;
    }

    return data;
  }

  static async createBathroom(bathroom: BathroomInsert) {
    const { data, error } = await supabase
      .from("bathrooms")
      .insert(bathroom)
      .select()
      .single();

    if (error) {
      console.error("Error creating bathroom:", error);
      throw error;
    }

    return data;
  }

  static async updateBathroom(id: string, updates: BathroomUpdate) {
    const { data, error } = await supabase
      .from("bathrooms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating bathroom:", error);
      throw error;
    }

    return data;
  }

  static async deleteBathroom(id: string) {
    const { error } = await supabase.from("bathrooms").delete().eq("id", id);

    if (error) {
      console.error("Error deleting bathroom:", error);
      throw error;
    }
  }

  static async getBathroomsByBuilding(building: string) {
    const { data, error } = await supabase
      .from("bathrooms")
      .select(
        `
        *,
        reviews (*)
      `
      )
      .eq("building", building);

    if (error) {
      console.error("Error fetching bathrooms by building:", error);
      throw error;
    }

    // Calcular campos dinamicamente
    const bathroomsWithCalculatedFields = (data || []).map((bathroom) => {
      const reviews = bathroom.reviews || [];

      if (reviews.length === 0) {
        return {
          ...bathroom,
          rating: undefined,
          review_count: 0,
          cleanliness: undefined,
          paper_supply: undefined,
          paper_availability: undefined,
          privacy: undefined,
        };
      }

      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const reviewCount = reviews.length;
      const avgCleanliness =
        reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length;
      const avgPaperSupply =
        reviews.reduce((sum, r) => sum + r.paper_supply, 0) / reviews.length;
      const avgPrivacy =
        reviews.reduce((sum, r) => sum + r.privacy, 0) / reviews.length;

      // Calcular paper availability percentage
      const availableReviews = reviews.filter(
        (r) => r.paper_available === true
      ).length;
      const paperAvailabilityPercent =
        reviews.length > 0
          ? Math.round((availableReviews / reviews.length) * 100)
          : 0;

      return {
        ...bathroom,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        cleanliness: this.getCleanlinessLabel(avgCleanliness),
        paper_supply: this.getPaperSupplyLabel(avgPaperSupply),
        paper_availability: paperAvailabilityPercent,
        privacy: this.getPrivacyLabel(avgPrivacy),
      };
    });

    // Ordenar por rating
    return bathroomsWithCalculatedFields.sort((a, b) => {
      if (a.rating === undefined && b.rating === undefined) return 0;
      if (a.rating === undefined) return 1;
      if (b.rating === undefined) return -1;
      return b.rating - a.rating;
    });
  }

  static async getBathroomsByFloor(floor: string) {
    const { data, error } = await supabase
      .from("bathrooms")
      .select(
        `
        *,
        reviews (*)
      `
      )
      .eq("floor", floor);

    if (error) {
      console.error("Error fetching bathrooms by floor:", error);
      throw error;
    }

    // Calcular campos dinamicamente
    const bathroomsWithCalculatedFields = (data || []).map((bathroom) => {
      const reviews = bathroom.reviews || [];

      if (reviews.length === 0) {
        return {
          ...bathroom,
          rating: undefined,
          review_count: 0,
          cleanliness: undefined,
          paper_supply: undefined,
          paper_availability: undefined,
          privacy: undefined,
        };
      }

      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const reviewCount = reviews.length;
      const avgCleanliness =
        reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length;
      const avgPaperSupply =
        reviews.reduce((sum, r) => sum + r.paper_supply, 0) / reviews.length;
      const avgPrivacy =
        reviews.reduce((sum, r) => sum + r.privacy, 0) / reviews.length;

      // Calcular paper availability percentage
      const availableReviews = reviews.filter(
        (r) => r.paper_available === true
      ).length;
      const paperAvailabilityPercent =
        reviews.length > 0
          ? Math.round((availableReviews / reviews.length) * 100)
          : 0;

      return {
        ...bathroom,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        cleanliness: this.getCleanlinessLabel(avgCleanliness),
        paper_supply: this.getPaperSupplyLabel(avgPaperSupply),
        paper_availability: paperAvailabilityPercent,
        privacy: this.getPrivacyLabel(avgPrivacy),
      };
    });

    // Ordenar por rating
    return bathroomsWithCalculatedFields.sort((a, b) => {
      if (a.rating === undefined && b.rating === undefined) return 0;
      if (a.rating === undefined) return 1;
      if (b.rating === undefined) return -1;
      return b.rating - a.rating;
    });
  }

  static async searchBathrooms(query: string) {
    const { data, error } = await supabase
      .from("bathrooms")
      .select(
        `
        *,
        reviews (*)
      `
      )
      .or(
        `name.ilike.%${query}%,building.ilike.%${query}%,floor.ilike.%${query}%`
      );

    if (error) {
      console.error("Error searching bathrooms:", error);
      throw error;
    }

    // Calcular campos dinamicamente
    const bathroomsWithCalculatedFields = (data || []).map((bathroom) => {
      const reviews = bathroom.reviews || [];

      if (reviews.length === 0) {
        return {
          ...bathroom,
          rating: undefined,
          review_count: 0,
          cleanliness: undefined,
          paper_supply: undefined,
          paper_availability: undefined,
          privacy: undefined,
        };
      }

      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const reviewCount = reviews.length;
      const avgCleanliness =
        reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length;
      const avgPaperSupply =
        reviews.reduce((sum, r) => sum + r.paper_supply, 0) / reviews.length;
      const avgPrivacy =
        reviews.reduce((sum, r) => sum + r.privacy, 0) / reviews.length;

      // Calcular paper availability percentage
      const availableReviews = reviews.filter(
        (r) => r.paper_available === true
      ).length;
      const paperAvailabilityPercent =
        reviews.length > 0
          ? Math.round((availableReviews / reviews.length) * 100)
          : 0;

      return {
        ...bathroom,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        cleanliness: this.getCleanlinessLabel(avgCleanliness),
        paper_supply: this.getPaperSupplyLabel(avgPaperSupply),
        paper_availability: paperAvailabilityPercent,
        privacy: this.getPrivacyLabel(avgPrivacy),
      };
    });

    // Ordenar por rating
    return bathroomsWithCalculatedFields.sort((a, b) => {
      if (a.rating === undefined && b.rating === undefined) return 0;
      if (a.rating === undefined) return 1;
      if (b.rating === undefined) return -1;
      return b.rating - a.rating;
    });
  }

  static async getUniqueBuildings(): Promise<string[]> {
    const { data, error } = await supabase.from("bathrooms").select("building");

    if (error) {
      console.error("Error fetching buildings:", error);
      throw error;
    }

    const buildings = data?.map((item) => item.building) || [];
    return [...new Set(buildings)].sort();
  }

  static async getUniqueFloors(): Promise<string[]> {
    const { data, error } = await supabase.from("bathrooms").select("floor");

    if (error) {
      console.error("Error fetching floors:", error);
      throw error;
    }

    const floors = data?.map((item) => item.floor) || [];
    const uniqueFloors = [...new Set(floors)];
    return uniqueFloors.sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  }

  static async addReview(
    bathroomId: string,
    review: Omit<ReviewInsert, "bathroom_id">
  ): Promise<void> {
    // Check if this device has already reviewed this bathroom
    if (DeviceFingerprint.hasReviewedBathroom(bathroomId)) {
      throw new Error("ALREADY_REVIEWED");
    }

    const reviewData: ReviewInsert = {
      ...review,
      bathroom_id: bathroomId,
      date: new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw error;
    }

    // Mark this device as having reviewed this bathroom
    DeviceFingerprint.markReviewedBathroom(bathroomId);

    // Mark this review as belonging to this device
    if (data?.id) {
      DeviceFingerprint.markOwnReview(data.id);
    }

    // Invalidate cache since data has changed
    this.invalidateCache();

    // Não precisamos mais atualizar estatísticas estáticas - elas são calculadas dinamicamente
  }

  static async updateReview(
    reviewId: string,
    bathroomId: string,
    review: Omit<ReviewInsert, "bathroom_id">
  ): Promise<void> {
    // Check if this device owns this review
    if (!DeviceFingerprint.isOwnReview(reviewId)) {
      throw new Error("NOT_OWN_REVIEW");
    }

    const reviewData = {
      ...review,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("reviews")
      .update(reviewData)
      .eq("id", reviewId)
      .eq("bathroom_id", bathroomId);

    if (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  private static getCleanlinessLabel(avg: number): string {
    if (avg >= 4.5) return "Sempre limpo";
    if (avg >= 3.5) return "Geralmente limpo";
    if (avg >= 2.5) return "Às vezes limpo";
    return "Raramente limpo";
  }

  private static getPaperSupplyLabel(avg: number): "Bom" | "Médio" | "Fraco" {
    if (avg >= 4) return "Bom";
    if (avg >= 2.5) return "Médio";
    return "Fraco";
  }

  private static getPrivacyLabel(avg: number): "Excelente" | "Boa" | "Média" {
    if (avg >= 4) return "Excelente";
    if (avg >= 2.5) return "Boa";
    return "Média";
  }

  static async getStatistics() {
    // Get total reviews count
    const { count: totalReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    if (reviewsError) {
      console.error("Error fetching total reviews:", reviewsError);
      throw reviewsError;
    }

    // Get average rating from all reviews
    const { data: ratingData, error: ratingError } = await supabase
      .from("reviews")
      .select("rating");

    if (ratingError) {
      console.error("Error fetching ratings:", ratingError);
      throw ratingError;
    }

    const avgRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length
        : 0;

    // Get buildings count (buildings that have at least one review)
    const { data: buildingsData, error: buildingsError } = await supabase
      .from("bathrooms")
      .select("building, reviews!inner(*)");

    if (buildingsError) {
      console.error("Error fetching buildings with reviews:", buildingsError);
      throw buildingsError;
    }

    const buildingsCount =
      buildingsData && buildingsData.length > 0
        ? new Set(buildingsData.map((b) => b.building)).size
        : 0;

    // Get most common cleanliness level
    const { data: cleanlinessData, error: cleanlinessError } = await supabase
      .from("reviews")
      .select("cleanliness");

    if (cleanlinessError) {
      console.error("Error fetching cleanliness data:", cleanlinessError);
      throw cleanlinessError;
    }

    let mostCommonCleanliness = "N/A";
    if (cleanlinessData && cleanlinessData.length > 0) {
      const cleanlinessCounts = cleanlinessData.reduce((acc, review) => {
        const level = this.getCleanlinessLabel(review.cleanliness);
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommon = Object.entries(cleanlinessCounts).sort(
        ([, a], [, b]) => b - a
      )[0];
      mostCommonCleanliness = mostCommon ? mostCommon[0] : "N/A";
    }

    return {
      totalReviews: totalReviews || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      buildingsCount,
      mostCommonCleanliness,
    };
  }

  static async getRecentReviews(limit: number = 10) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        bathrooms (
          id,
          name,
          building,
          floor
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent reviews:", error);
      throw error;
    }

    return data || [];
  }
}
