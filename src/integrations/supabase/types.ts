export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address_line: string
          agency_fee: string | null
          agency_id: string
          amenities: Json | null
          availability_date: string
          bathrooms: number
          bedrooms: number
          bills_included: boolean | null
          city: string
          country: string
          created_at: string | null
          deposit_eur: number
          description: string
          expires_at: string | null
          floor: string | null
          furnished: boolean | null
          id: string
          images: Json | null
          lat: number
          lng: number
          published_at: string | null
          rent_monthly_eur: number
          size_sqm: number | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          address_line: string
          agency_fee?: string | null
          agency_id: string
          amenities?: Json | null
          availability_date: string
          bathrooms: number
          bedrooms: number
          bills_included?: boolean | null
          city: string
          country: string
          created_at?: string | null
          deposit_eur: number
          description: string
          expires_at?: string | null
          floor?: string | null
          furnished?: boolean | null
          id?: string
          images?: Json | null
          lat: number
          lng: number
          published_at?: string | null
          rent_monthly_eur: number
          size_sqm?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          address_line?: string
          agency_fee?: string | null
          agency_id?: string
          amenities?: Json | null
          availability_date?: string
          bathrooms?: number
          bedrooms?: number
          bills_included?: boolean | null
          city?: string
          country?: string
          created_at?: string | null
          deposit_eur?: number
          description?: string
          expires_at?: string | null
          floor?: string | null
          furnished?: boolean | null
          id?: string
          images?: Json | null
          lat?: number
          lng?: number
          published_at?: string | null
          rent_monthly_eur?: number
          size_sqm?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_listings_agency_id"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          agency_id: string
          conversation_id: string | null
          created_at: string
          id: string
          listing_id: string
          message: string
          read_at: string | null
          replied_at: string | null
          sender_id: string
          sender_name: string
          sender_phone: string | null
          sender_university: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          listing_id: string
          message: string
          read_at?: string | null
          replied_at?: string | null
          sender_id: string
          sender_name: string
          sender_phone?: string | null
          sender_university?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          message?: string
          read_at?: string | null
          replied_at?: string | null
          sender_id?: string
          sender_name?: string
          sender_phone?: string | null
          sender_university?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          company_size: string | null
          created_at: string
          description: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          university: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          company_size?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          company_size?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_verify_user_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      agency_has_published_listings: {
        Args: { agency_profile_id: string }
        Returns: boolean
      }
      generate_conversation_id: {
        Args: { p_listing_id: string; p_student_id: string }
        Returns: string
      }
      get_agency_business_info: {
        Args: { agency_id_param: string }
        Returns: {
          agency_name: string
        }[]
      }
      get_agency_contact_for_conversation: {
        Args: { agency_id_param: string }
        Returns: {
          agency_email: string
          agency_name: string
          agency_phone: string
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          agency_name: string | null
          avatar_url: string | null
          company_size: string | null
          created_at: string
          description: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          university: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
      }
      get_listings_with_agency: {
        Args: {
          p_city?: string
          p_limit?: number
          p_listing_type?: string
          p_max_price?: number
          p_min_bedrooms?: number
          p_min_price?: number
          p_offset?: number
        }
        Returns: {
          address_line: string
          agency_name: string
          amenities: Json
          availability_date: string
          bathrooms: number
          bedrooms: number
          bills_included: boolean
          city: string
          country: string
          created_at: string
          deposit_eur: number
          description: string
          floor: string
          furnished: boolean
          id: string
          images: Json
          lat: number
          lng: number
          published_at: string
          rent_monthly_eur: number
          size_sqm: number
          status: string
          title: string
          type: string
          video_url: string
        }[]
      }
      get_user_profile_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_sent_messages_to_any_listing: {
        Args: Record<PropertyKey, never>
        Returns: {
          listing_id: string
        }[]
      }
      user_has_sent_messages_to_listing: {
        Args: { p_listing_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
