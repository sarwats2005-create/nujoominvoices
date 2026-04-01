export interface UsedBL {
  id: string;
  user_id: string;
  dashboard_id: string | null;
  bl_no: string;
  container_no: string;
  invoice_amount: number;
  invoice_date: string;
  bank: string;
  owner: string;
  used_for: string;
  used_for_beneficiary: string | null;
  notes: string | null;
  currency: string;
  is_active: boolean;
  is_archived: boolean;
  archive_folder_id: string | null;
  source_unused_bl_id: string | null;
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
  used_for_beneficiary?: string | null;
  notes?: string | null;
  dashboard_id?: string | null;
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

export interface BLDashboard {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
