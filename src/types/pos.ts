export interface ProductCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  price: number;
  cost_price: number;
  tax_rate: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  user_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price_override: number | null;
  cost_price_override: number | null;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface POSSale {
  id: string;
  user_id: string;
  customer_id: string | null;
  sale_number: string;
  subtotal: number;
  discount_amount: number;
  discount_type: string;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  items?: POSSaleItem[];
  customer?: Customer;
}

export interface POSSaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
}
