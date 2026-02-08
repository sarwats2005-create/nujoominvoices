export interface UsedBL {
  id: string;
  user_id: string;
  bl_no: string;
  container_no: string;
  invoice_amount: number;
  invoice_date: string;
  bank: string;
  owner: string;
  used_for: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsedBLInsert {
  bl_no: string;
  container_no: string;
  invoice_amount: number;
  invoice_date: string;
  bank: string;
  owner: string;
  used_for: string;
  notes?: string | null;
}

export interface UsedBLUpdate {
  bl_no?: string;
  container_no?: string;
  invoice_amount?: number;
  invoice_date?: string;
  bank?: string;
  owner?: string;
  used_for?: string;
  notes?: string | null;
}
