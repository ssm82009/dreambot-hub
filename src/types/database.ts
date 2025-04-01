
// أنواع للجداول التي أنشأناها في قاعدة البيانات
export type AiSettings = {
  id: string;
  provider: string;
  api_key: string;
  model: string;
  created_at?: string;
  updated_at?: string;
};

export type InterpretationSettings = {
  id: string;
  max_input_words: number;
  min_output_words: number;
  max_output_words: number;
  system_instructions: string;
  created_at?: string;
  updated_at?: string;
};

export type PricingSettings = {
  id: string;
  free_plan_price: number;
  free_plan_interpretations: number;
  free_plan_features: string;
  premium_plan_price: number;
  premium_plan_interpretations: number;
  premium_plan_features: string;
  pro_plan_price: number;
  pro_plan_interpretations: number;
  pro_plan_features: string;
  created_at?: string;
  updated_at?: string;
};

export type PaymentSettings = {
  id: string;
  paylink_enabled: boolean;
  paylink_api_key: string | null;
  paylink_secret_key: string | null;
  paypal_enabled: boolean;
  paypal_client_id: string | null;
  paypal_secret: string | null;
  paypal_sandbox: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ThemeSettings = {
  id: string;
  primary_color: string;
  button_color: string;
  text_color: string;
  background_color: string;
  logo_text: string;
  logo_font_size: number;
  header_color: string;
  footer_color: string;
  footer_text: string;
  twitter_link: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  subscription_type: string | null;
  subscription_expires_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type Dream = {
  id: string;
  dream_text: string;
  interpretation: string;
  user_id: string | null;
  tags: string[] | null;
  created_at: string;
};

export type DreamSymbol = {
  id: string;
  symbol: string;
  interpretation: string;
  category: string | null;
};
