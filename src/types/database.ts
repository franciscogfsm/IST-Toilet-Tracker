export interface Database {
  public: {
    Tables: {
      bathrooms: {
        Row: {
          id: string;
          name: string;
          building: string;
          x: number;
          y: number;
          floor: string;
          facilities: string[];
          has_accessible?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          building: string;
          x: number;
          y: number;
          floor: string;
          facilities: string[];
          has_accessible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          building?: string;
          x?: number;
          y?: number;
          floor?: string;
          facilities?: string[];
          has_accessible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          bathroom_id: string;
          user_name: string;
          rating: number;
          comment: string;
          date: string;
          cleanliness: number;
          paper_supply: number;
          privacy: number;
          paper_available?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bathroom_id: string;
          user_name: string;
          rating: number;
          comment: string;
          date: string;
          cleanliness: number;
          paper_supply: number;
          privacy: number;
          paper_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bathroom_id?: string;
          user_name?: string;
          rating?: number;
          comment?: string;
          date?: string;
          cleanliness?: number;
          paper_supply?: number;
          privacy?: number;
          paper_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
