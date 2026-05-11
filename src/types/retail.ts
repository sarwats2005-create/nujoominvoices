export interface Supplier {
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

export type POStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  user_id: string;
  supplier_id: string | null;
  po_number: string;
  status: POStatus;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total: number;
  created_at: string;
}

export interface POSReturn {
  id: string;
  user_id: string;
  original_sale_id: string | null;
  return_number: string;
  customer_id: string | null;
  refund_amount: number;
  refund_method: 'cash' | 'store_credit' | 'original';
  reason: string | null;
  notes: string | null;
  created_at: string;
  items?: POSReturnItem[];
}

export interface POSReturnItem {
  id: string;
  return_id: string;
  sale_item_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  refund_total: number;
  restock: boolean;
  created_at: string;
}

export interface HeldSale {
  id: string;
  user_id: string;
  customer_id: string | null;
  hold_label: string | null;
  cart_snapshot: any;
  notes: string | null;
  held_at: string;
  created_at: string;
}

export interface LoyaltySettings {
  id: string;
  user_id: string;
  enabled: boolean;
  points_per_unit_currency: number;
  redemption_value: number;
  currency: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  customer_id: string;
  sale_id: string | null;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  balance_after: number;
  notes: string | null;
  created_at: string;
}

export interface POSSettings {
  id: string;
  user_id: string;
  store_name: string | null;
  receipt_header: string | null;
  receipt_footer: string | null;
  default_tax_rate: number;
  low_stock_alert_enabled: boolean;
  currency: string;
  logo_url: string | null;
}
