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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      archive_folders: {
        Row: {
          color: string | null
          created_at: string
          dashboard_id: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          dashboard_id?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          dashboard_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_folders_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bl_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number
          attempt_type: string
          blocked_until: string | null
          first_attempt_at: string
          id: string
          identifier: string
          last_attempt_at: string
        }
        Insert: {
          attempt_count?: number
          attempt_type: string
          blocked_until?: string | null
          first_attempt_at?: string
          id?: string
          identifier: string
          last_attempt_at?: string
        }
        Update: {
          attempt_count?: number
          attempt_type?: string
          blocked_until?: string | null
          first_attempt_at?: string
          id?: string
          identifier?: string
          last_attempt_at?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      bl_change_log: {
        Row: {
          action: string
          bl_id: string
          bl_no: string
          changed_fields: Json | null
          dashboard_id: string | null
          id: string
          performed_at: string
          performed_by: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          action: string
          bl_id: string
          bl_no: string
          changed_fields?: Json | null
          dashboard_id?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          action?: string
          bl_id?: string
          bl_no?: string
          changed_fields?: Json | null
          dashboard_id?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bl_dashboards: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bl_presets: {
        Row: {
          created_at: string | null
          id: string
          type: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          type: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          loyalty_points: number
          name: string
          notes: string | null
          phone: string | null
          store_credit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          loyalty_points?: number
          name: string
          notes?: string | null
          phone?: string | null
          store_credit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          loyalty_points?: number
          name?: string
          notes?: string | null
          phone?: string | null
          store_credit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      held_sales: {
        Row: {
          cart_snapshot: Json
          created_at: string
          customer_id: string | null
          held_at: string
          hold_label: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          cart_snapshot: Json
          created_at?: string
          customer_id?: string | null
          held_at?: string
          hold_label?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          cart_snapshot?: Json
          created_at?: string
          customer_id?: string | null
          held_at?: string
          hold_label?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoice_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          invoice_id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          invoice_id: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          invoice_id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          bank: string
          beneficiary: string
          container_number: string | null
          created_at: string
          currency: string
          dashboard_id: string
          date: string
          id: string
          invoice_number: string
          status: string
          swift_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank: string
          beneficiary: string
          container_number?: string | null
          created_at?: string
          currency?: string
          dashboard_id: string
          date: string
          id?: string
          invoice_number: string
          status?: string
          swift_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank?: string
          beneficiary?: string
          container_number?: string | null
          created_at?: string
          currency?: string
          dashboard_id?: string
          date?: string
          id?: string
          invoice_number?: string
          status?: string
          swift_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          created_at: string
          currency: string
          enabled: boolean
          id: string
          points_per_unit_currency: number
          redemption_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          enabled?: boolean
          id?: string
          points_per_unit_currency?: number
          redemption_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          enabled?: boolean
          id?: string
          points_per_unit_currency?: number
          redemption_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          balance_after: number
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          points: number
          sale_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          balance_after?: number
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          points?: number
          sale_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          points?: number
          sale_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      map_location: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          updated_at: string | null
          zoom_level: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
          zoom_level?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
          zoom_level?: number | null
        }
        Relationships: []
      }
      pos_return_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          refund_total: number
          restock: boolean
          return_id: string
          sale_item_id: string | null
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          refund_total?: number
          restock?: boolean
          return_id: string
          sale_item_id?: string | null
          unit_price?: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          refund_total?: number
          restock?: boolean
          return_id?: string
          sale_item_id?: string | null
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "pos_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_returns: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          original_sale_id: string | null
          reason: string | null
          refund_amount: number
          refund_method: string
          return_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          original_sale_id?: string | null
          reason?: string | null
          refund_amount?: number
          refund_method?: string
          return_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          original_sale_id?: string | null
          reason?: string | null
          refund_amount?: number
          refund_method?: string
          return_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_returns_original_sale_id_fkey"
            columns: ["original_sale_id"]
            isOneToOne: false
            referencedRelation: "pos_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sale_items: {
        Row: {
          created_at: string
          discount: number
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          tax: number
          total: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          tax?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          tax?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "pos_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sales: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          discount_amount: number
          discount_type: string
          id: string
          loyalty_earned: number
          loyalty_redeemed: number
          notes: string | null
          payment_method: string
          payment_status: string
          refunded_amount: number
          sale_number: string
          status: string
          store_credit_used: number
          subtotal: number
          tax_amount: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          loyalty_earned?: number
          loyalty_redeemed?: number
          notes?: string | null
          payment_method?: string
          payment_status?: string
          refunded_amount?: number
          sale_number: string
          status?: string
          store_credit_used?: number
          subtotal?: number
          tax_amount?: number
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          loyalty_earned?: number
          loyalty_redeemed?: number
          notes?: string | null
          payment_method?: string
          payment_status?: string
          refunded_amount?: number
          sale_number?: string
          status?: string
          store_credit_used?: number
          subtotal?: number
          tax_amount?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_settings: {
        Row: {
          created_at: string
          currency: string
          default_tax_rate: number
          id: string
          logo_url: string | null
          low_stock_alert_enabled: boolean
          receipt_footer: string | null
          receipt_header: string | null
          store_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_tax_rate?: number
          id?: string
          logo_url?: string | null
          low_stock_alert_enabled?: boolean
          receipt_footer?: string | null
          receipt_header?: string | null
          store_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_tax_rate?: number
          id?: string
          logo_url?: string | null
          low_stock_alert_enabled?: boolean
          receipt_footer?: string | null
          receipt_header?: string | null
          store_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          barcode: string | null
          cost_price_override: number | null
          created_at: string
          id: string
          is_active: boolean
          min_stock_level: number
          name: string
          price_override: number | null
          product_id: string
          sku: string | null
          stock_quantity: number
          user_id: string
        }
        Insert: {
          barcode?: string | null
          cost_price_override?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name: string
          price_override?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number
          user_id: string
        }
        Update: {
          barcode?: string | null
          cost_price_override?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name?: string
          price_override?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_negative_stock: boolean
          barcode: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          sku: string | null
          tax_rate: number | null
          track_stock: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_negative_stock?: boolean
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          sku?: string | null
          tax_rate?: number | null
          track_stock?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_negative_stock?: boolean
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          sku?: string | null
          tax_rate?: number | null
          track_stock?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          po_id: string
          product_id: string | null
          product_name: string
          quantity_ordered: number
          quantity_received: number
          total: number
          unit_cost: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          po_id: string
          product_id?: string | null
          product_name: string
          quantity_ordered?: number
          quantity_received?: number
          total?: number
          unit_cost?: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          po_id?: string
          product_id?: string | null
          product_name?: string
          quantity_ordered?: number
          quantity_received?: number
          total?: number
          unit_cost?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          currency: string
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          received_date: string | null
          status: string
          subtotal: number
          supplier_id: string | null
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          received_date?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          received_date?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          cost_price: number | null
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference: string | null
          user_id: string
          variant_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference?: string | null
          user_id: string
          variant_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference?: string | null
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          balance: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unused_bl: {
        Row: {
          bl_date: string
          bl_no: string
          clearance_company: string
          clearance_date: string
          container_no: string
          created_at: string
          id: string
          original_used_data: Json | null
          owner: string
          port_of_loading: string
          product_category: string
          product_description: string
          quantity_unit: string | null
          quantity_value: number | null
          received_date: string | null
          revert_reason: string | null
          reverted_at: string | null
          shipper_name: string | null
          status: string
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          bl_date: string
          bl_no: string
          clearance_company: string
          clearance_date: string
          container_no: string
          created_at?: string
          id?: string
          original_used_data?: Json | null
          owner: string
          port_of_loading: string
          product_category: string
          product_description: string
          quantity_unit?: string | null
          quantity_value?: number | null
          received_date?: string | null
          revert_reason?: string | null
          reverted_at?: string | null
          shipper_name?: string | null
          status?: string
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          bl_date?: string
          bl_no?: string
          clearance_company?: string
          clearance_date?: string
          container_no?: string
          created_at?: string
          id?: string
          original_used_data?: Json | null
          owner?: string
          port_of_loading?: string
          product_category?: string
          product_description?: string
          quantity_unit?: string | null
          quantity_value?: number | null
          received_date?: string | null
          revert_reason?: string | null
          reverted_at?: string | null
          shipper_name?: string | null
          status?: string
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unused_bl_files: {
        Row: {
          file_type: string
          file_url: string
          id: string
          original_filename: string
          page_label: string | null
          unused_bl_id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_type?: string
          file_url: string
          id?: string
          original_filename: string
          page_label?: string | null
          unused_bl_id: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_type?: string
          file_url?: string
          id?: string
          original_filename?: string
          page_label?: string | null
          unused_bl_id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unused_bl_files_unused_bl_id_fkey"
            columns: ["unused_bl_id"]
            isOneToOne: false
            referencedRelation: "unused_bl"
            referencedColumns: ["id"]
          },
        ]
      }
      unused_bl_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_type: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_type: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_type?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      used_bl_counting: {
        Row: {
          archive_folder_id: string | null
          bank: string
          bl_no: string
          container_no: string
          created_at: string
          currency: string
          dashboard_id: string | null
          id: string
          invoice_amount: number
          invoice_date: string
          is_active: boolean
          is_archived: boolean
          notes: string | null
          owner: string
          source_unused_bl_id: string | null
          updated_at: string
          used_for: string
          used_for_beneficiary: string | null
          user_id: string
        }
        Insert: {
          archive_folder_id?: string | null
          bank: string
          bl_no: string
          container_no: string
          created_at?: string
          currency?: string
          dashboard_id?: string | null
          id?: string
          invoice_amount: number
          invoice_date: string
          is_active?: boolean
          is_archived?: boolean
          notes?: string | null
          owner: string
          source_unused_bl_id?: string | null
          updated_at?: string
          used_for: string
          used_for_beneficiary?: string | null
          user_id: string
        }
        Update: {
          archive_folder_id?: string | null
          bank?: string
          bl_no?: string
          container_no?: string
          created_at?: string
          currency?: string
          dashboard_id?: string | null
          id?: string
          invoice_amount?: number
          invoice_date?: string
          is_active?: boolean
          is_archived?: boolean
          notes?: string | null
          owner?: string
          source_unused_bl_id?: string | null
          updated_at?: string
          used_for?: string
          used_for_beneficiary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_bl_counting_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bl_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_bl_counting_source_unused_bl_id_fkey"
            columns: ["source_unused_bl_id"]
            isOneToOne: false
            referencedRelation: "unused_bl"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      clear_rate_limit: {
        Args: { p_attempt_type: string; p_identifier: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_first_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
