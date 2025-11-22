export type Size = 'small' | 'medium' | 'large';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface PricingConfig {
  id: string;
  size: Size;
  price: number;
  dimensions: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  is_custom: boolean;
  original_image_url: string | null;
  converted_image_url: string | null;
  three_mf_file_url: string | null;
  size: Size;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface CartItem {
  original_image_url: string;
  converted_image_url: string;
  size: Size;
  price: number;
  quantity: number;
}

