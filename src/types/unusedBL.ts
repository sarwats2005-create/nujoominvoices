export interface UnusedBL {
  id: string;
  user_id: string;
  bl_no: string;
  container_no: string;
  owner: string;
  clearance_company: string;
  product_description: string;
  product_category: string;
  bl_date: string;
  clearance_date: string;
  quantity_value: number | null;
  quantity_unit: string | null;
  shipper_name: string | null;
  port_of_loading: string;
  status: 'UNUSED' | 'USED';
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnusedBLFile {
  id: string;
  unused_bl_id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  original_filename: string;
  page_label: string | null;
  uploaded_at: string;
}

export interface UnusedBLSetting {
  id: string;
  user_id: string;
  setting_type: string;
  value: string;
  is_active: boolean;
  created_at: string;
}

export type SettingType = 'owner' | 'clearance_company' | 'product_category' | 'quantity_unit' | 'port_of_loading';

export interface UseBLFormData {
  using_for: string;
  bank: string;
  invoice_amount: number;
  currency: string;
  invoice_date: string;
  used_for_manufacturer: string;
  used_for_beneficiary: string;
  dashboard_id: string;
}
