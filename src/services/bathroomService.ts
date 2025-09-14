import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Bathroom = Database["public"]["Tables"]["bathrooms"]["Row"];
type BathroomInsert = Database["public"]["Tables"]["bathrooms"]["Insert"];
type BathroomUpdate = Database["public"]["Tables"]["bathrooms"]["Update"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

export class BathroomService {
  static async getAllBathrooms() {
    const { data, error } = await supabase
      .from("bathrooms")
      .select(
        `
        *,
        reviews (*)
      `
      )
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching bathrooms:", error);
      throw error;
    }

    return data || [];
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
      .eq("building", building)
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching bathrooms by building:", error);
      throw error;
    }

    return data || [];
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
      .eq("floor", floor)
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching bathrooms by floor:", error);
      throw error;
    }

    return data || [];
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
      )
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error searching bathrooms:", error);
      throw error;
    }

    return data || [];
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
    const reviewData: ReviewInsert = {
      ...review,
      bathroom_id: bathroomId,
      date: new Date().toISOString().split("T")[0],
    };

    const { error } = await supabase.from("reviews").insert(reviewData);

    if (error) {
      console.error("Error adding review:", error);
      throw error;
    }

    // Update bathroom stats after adding review
    await this.updateBathroomStats(bathroomId);
  }

  private static async updateBathroomStats(bathroomId: string) {
    // Get all reviews for this bathroom
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating, cleanliness, paper_supply, privacy")
      .eq("bathroom_id", bathroomId);

    if (reviewsError) {
      console.error("Error fetching reviews for stats update:", reviewsError);
      return;
    }

    if (!reviews || reviews.length === 0) {
      // No reviews, reset to default values
      await supabase
        .from("bathrooms")
        .update({
          rating: 0,
          review_count: 0,
          cleanliness: "Não avaliado",
          paper_supply: "Não avaliado" as any,
          privacy: "Não avaliado" as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bathroomId);
      return;
    }

    // Calculate averages
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const avgCleanliness =
      reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length;
    const avgPaperSupply =
      reviews.reduce((sum, r) => sum + r.paper_supply, 0) / reviews.length;
    const avgPrivacy =
      reviews.reduce((sum, r) => sum + r.privacy, 0) / reviews.length;

    // Convert numerical averages to categorical values
    const cleanlinessLabel = this.getCleanlinessLabel(avgCleanliness);
    const paperSupplyLabel = this.getPaperSupplyLabel(avgPaperSupply);
    const privacyLabel = this.getPrivacyLabel(avgPrivacy);

    // Update bathroom with new stats
    await supabase
      .from("bathrooms")
      .update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
        cleanliness: cleanlinessLabel,
        paper_supply: paperSupplyLabel,
        privacy: privacyLabel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bathroomId);
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
      .select("building")
      .not("review_count", "eq", 0);

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
}
