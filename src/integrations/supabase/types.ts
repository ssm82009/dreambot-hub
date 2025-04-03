export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_settings: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          model: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          model?: string
          provider?: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          model?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dream_symbols: {
        Row: {
          category: string | null
          id: string
          interpretation: string
          symbol: string
        }
        Insert: {
          category?: string | null
          id?: string
          interpretation: string
          symbol: string
        }
        Update: {
          category?: string | null
          id?: string
          interpretation?: string
          symbol?: string
        }
        Relationships: []
      }
      dreams: {
        Row: {
          created_at: string
          dream_text: string
          id: string
          interpretation: string
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dream_text: string
          id?: string
          interpretation: string
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dream_text?: string
          id?: string
          interpretation?: string
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      interpretation_settings: {
        Row: {
          created_at: string | null
          id: string
          max_input_words: number
          max_output_words: number
          min_output_words: number
          system_instructions: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_input_words?: number
          max_output_words?: number
          min_output_words?: number
          system_instructions?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_input_words?: number
          max_output_words?: number
          min_output_words?: number
          system_instructions?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      navbar_links: {
        Row: {
          created_at: string | null
          id: string
          is_admin_only: boolean
          order: number
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin_only?: boolean
          order: number
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin_only?: boolean
          order?: number
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      payment_invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_method: string
          plan_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          payment_method: string
          plan_name: string
          status: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          payment_method?: string
          plan_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string | null
          id: string
          paylink_api_key: string | null
          paylink_enabled: boolean
          paylink_secret_key: string | null
          paypal_client_id: string | null
          paypal_enabled: boolean
          paypal_sandbox: boolean
          paypal_secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paylink_api_key?: string | null
          paylink_enabled?: boolean
          paylink_secret_key?: string | null
          paypal_client_id?: string | null
          paypal_enabled?: boolean
          paypal_sandbox?: boolean
          paypal_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paylink_api_key?: string | null
          paylink_enabled?: boolean
          paylink_secret_key?: string | null
          paypal_client_id?: string | null
          paypal_enabled?: boolean
          paypal_sandbox?: boolean
          paypal_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_settings: {
        Row: {
          created_at: string | null
          free_plan_features: string
          free_plan_interpretations: number
          free_plan_name: string
          free_plan_price: number
          id: string
          premium_plan_features: string
          premium_plan_interpretations: number
          premium_plan_name: string
          premium_plan_price: number
          pro_plan_features: string
          pro_plan_interpretations: number
          pro_plan_name: string
          pro_plan_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          free_plan_features?: string
          free_plan_interpretations?: number
          free_plan_name?: string
          free_plan_price?: number
          id?: string
          premium_plan_features?: string
          premium_plan_interpretations?: number
          premium_plan_name?: string
          premium_plan_price?: number
          pro_plan_features?: string
          pro_plan_interpretations?: number
          pro_plan_name?: string
          pro_plan_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          free_plan_features?: string
          free_plan_interpretations?: number
          free_plan_name?: string
          free_plan_price?: number
          id?: string
          premium_plan_features?: string
          premium_plan_interpretations?: number
          premium_plan_name?: string
          premium_plan_price?: number
          pro_plan_features?: string
          pro_plan_interpretations?: number
          pro_plan_name?: string
          pro_plan_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          background_color: string
          button_color: string
          created_at: string | null
          custom_head_tags: string | null
          enable_canonical_urls: boolean | null
          enable_open_graph: boolean | null
          enable_robots_txt: boolean | null
          enable_sitemap: boolean | null
          enable_twitter_cards: boolean | null
          facebook_link: string | null
          footer_color: string
          footer_text: string
          google_analytics_id: string | null
          header_color: string
          id: string
          instagram_link: string | null
          keywords: string | null
          logo_font_size: number
          logo_text: string
          meta_description: string | null
          meta_title: string | null
          primary_color: string
          text_color: string
          twitter_link: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string
          button_color?: string
          created_at?: string | null
          custom_head_tags?: string | null
          enable_canonical_urls?: boolean | null
          enable_open_graph?: boolean | null
          enable_robots_txt?: boolean | null
          enable_sitemap?: boolean | null
          enable_twitter_cards?: boolean | null
          facebook_link?: string | null
          footer_color?: string
          footer_text?: string
          google_analytics_id?: string | null
          header_color?: string
          id?: string
          instagram_link?: string | null
          keywords?: string | null
          logo_font_size?: number
          logo_text?: string
          meta_description?: string | null
          meta_title?: string | null
          primary_color?: string
          text_color?: string
          twitter_link?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string
          button_color?: string
          created_at?: string | null
          custom_head_tags?: string | null
          enable_canonical_urls?: boolean | null
          enable_open_graph?: boolean | null
          enable_robots_txt?: boolean | null
          enable_sitemap?: boolean | null
          enable_twitter_cards?: boolean | null
          facebook_link?: string | null
          footer_color?: string
          footer_text?: string
          google_analytics_id?: string | null
          header_color?: string
          id?: string
          instagram_link?: string | null
          keywords?: string | null
          logo_font_size?: number
          logo_text?: string
          meta_description?: string | null
          meta_title?: string | null
          primary_color?: string
          text_color?: string
          twitter_link?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          subscription_expires_at: string | null
          subscription_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
