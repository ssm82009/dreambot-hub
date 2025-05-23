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
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
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
      fcm_tokens: {
        Row: {
          created_at: string | null
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      firebase_config: {
        Row: {
          api_key: string
          app_id: string
          auth_domain: string
          created_at: string
          id: string
          measurement_id: string | null
          messaging_sender_id: string
          project_id: string
          service_account_key: Json | null
          storage_bucket: string
          updated_at: string
        }
        Insert: {
          api_key: string
          app_id: string
          auth_domain: string
          created_at?: string
          id?: string
          measurement_id?: string | null
          messaging_sender_id: string
          project_id: string
          service_account_key?: Json | null
          storage_bucket: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          app_id?: string
          auth_domain?: string
          created_at?: string
          id?: string
          measurement_id?: string | null
          messaging_sender_id?: string
          project_id?: string
          service_account_key?: Json | null
          storage_bucket?: string
          updated_at?: string
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
      notification_logs: {
        Row: {
          body: string
          id: string
          read_at: string | null
          sent_at: string
          title: string
          type: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          body: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title: string
          type?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title?: string
          type?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_invoices: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
          id?: string
          invoice_id?: string
          payment_method?: string
          plan_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_sessions: {
        Row: {
          amount: number
          completed: boolean | null
          created_at: string
          expires_at: string
          id: string
          payment_method: string
          plan_type: string
          session_id: string | null
          status: string | null
          transaction_identifier: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed?: boolean | null
          created_at?: string
          expires_at?: string
          id?: string
          payment_method: string
          plan_type: string
          session_id?: string | null
          status?: string | null
          transaction_identifier?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed?: boolean | null
          created_at?: string
          expires_at?: string
          id?: string
          payment_method?: string
          plan_type?: string
          session_id?: string | null
          status?: string | null
          transaction_identifier?: string | null
          user_id?: string
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          home_sections: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          home_sections?: Json | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          home_sections?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          created_at: string
          id: string
          interpretations_used: number
          subscription_expires_at: string | null
          subscription_started_at: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interpretations_used?: number
          subscription_expires_at?: string | null
          subscription_started_at?: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interpretations_used?: number
          subscription_expires_at?: string | null
          subscription_started_at?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
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
          navbar_border_color: string | null
          primary_color: string
          slug: string | null
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
          navbar_border_color?: string | null
          primary_color?: string
          slug?: string | null
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
          navbar_border_color?: string | null
          primary_color?: string
          slug?: string | null
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
      count_push_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_subscription_usage: {
        Args: { user_id: string }
        Returns: {
          interpretations_used: number
          subscription_type: string
          subscription_expires_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_latest_payment_invoices: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          invoice_id: string
          payment_method: string
          plan_name: string
          status: string
          user_id: string | null
        }[]
      }
      safe_timestamp_compare: {
        Args: { ts1: string; ts2: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
