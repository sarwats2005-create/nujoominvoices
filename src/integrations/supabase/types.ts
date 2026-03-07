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
      unused_bl: {
        Row: {
          bl_date: string
          bl_no: string
          clearance_company: string
          clearance_date: string
          container_no: string
          created_at: string
          id: string
          owner: string
          port_of_loading: string
          product_category: string
          product_description: string
          quantity_unit: string | null
          quantity_value: number | null
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
          owner: string
          port_of_loading: string
          product_category: string
          product_description: string
          quantity_unit?: string | null
          quantity_value?: number | null
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
          owner?: string
          port_of_loading?: string
          product_category?: string
          product_description?: string
          quantity_unit?: string | null
          quantity_value?: number | null
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
          bank: string
          bl_no: string
          container_no: string
          created_at: string
          dashboard_id: string | null
          id: string
          invoice_amount: number
          invoice_date: string
          is_active: boolean
          notes: string | null
          owner: string
          source_unused_bl_id: string | null
          updated_at: string
          used_for: string
          user_id: string
        }
        Insert: {
          bank: string
          bl_no: string
          container_no: string
          created_at?: string
          dashboard_id?: string | null
          id?: string
          invoice_amount: number
          invoice_date: string
          is_active?: boolean
          notes?: string | null
          owner: string
          source_unused_bl_id?: string | null
          updated_at?: string
          used_for: string
          user_id: string
        }
        Update: {
          bank?: string
          bl_no?: string
          container_no?: string
          created_at?: string
          dashboard_id?: string | null
          id?: string
          invoice_amount?: number
          invoice_date?: string
          is_active?: boolean
          notes?: string | null
          owner?: string
          source_unused_bl_id?: string | null
          updated_at?: string
          used_for?: string
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
