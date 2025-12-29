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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          created_at: string
          description: string | null
          disease_id: string | null
          doctor_id: string
          id: string
          meals: Json
          patient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          disease_id?: string | null
          doctor_id: string
          id?: string
          meals?: Json
          patient_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          disease_id?: string | null
          doctor_id?: string
          id?: string
          meals?: Json
          patient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
        ]
      }
      diseases: {
        Row: {
          avoid_foods: string[]
          causes: string[]
          created_at: string
          description: string
          id: string
          lifestyle_advice: string[]
          medicines: string[]
          name: string
          precautions: string[]
          recommended_foods: string[]
          symptoms: string[]
        }
        Insert: {
          avoid_foods?: string[]
          causes?: string[]
          created_at?: string
          description: string
          id?: string
          lifestyle_advice?: string[]
          medicines?: string[]
          name: string
          precautions?: string[]
          recommended_foods?: string[]
          symptoms?: string[]
        }
        Update: {
          avoid_foods?: string[]
          causes?: string[]
          created_at?: string
          description?: string
          id?: string
          lifestyle_advice?: string[]
          medicines?: string[]
          name?: string
          precautions?: string[]
          recommended_foods?: string[]
          symptoms?: string[]
        }
        Relationships: []
      }
      health_recommendations: {
        Row: {
          created_at: string
          description: string
          doctor_id: string
          id: string
          patient_id: string
          recommendation_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          doctor_id: string
          id?: string
          patient_id: string
          recommendation_type: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          recommendation_type?: string
          title?: string
        }
        Relationships: []
      }
      medical_reports: {
        Row: {
          created_at: string
          doctor_id: string | null
          file_url: string
          id: string
          notes: string | null
          patient_id: string
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          file_url: string
          id?: string
          notes?: string | null
          patient_id: string
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          patient_id?: string
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      nurse_patient: {
        Row: {
          assigned_at: string
          id: string
          nurse_id: string
          patient_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          nurse_id: string
          patient_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          nurse_id?: string
          patient_id?: string
        }
        Relationships: []
      }
      patient_doctor: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
        }
        Relationships: []
      }
      patient_vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          heart_rate: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          temperature?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string
          doctor_id: string
          id: string
          medications: Json
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosis: string
          doctor_id: string
          id?: string
          medications?: Json
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosis?: string
          doctor_id?: string
          id?: string
          medications?: Json
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      procedure_notes: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          notes: string
          nurse_id: string
          patient_id: string
          procedure_type: string
          vitals: Json | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes: string
          nurse_id: string
          patient_id: string
          procedure_type: string
          vitals?: Json | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes?: string
          nurse_id?: string
          patient_id?: string
          procedure_type?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "procedure_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      vein_analyses: {
        Row: {
          avoid_vein_score: number | null
          confidence: number | null
          created_at: string
          doctor_id: string | null
          id: string
          image_url: string
          notes: string | null
          overall_score: number | null
          patient_id: string
          primary_vein_score: number | null
          secondary_vein_score: number | null
        }
        Insert: {
          avoid_vein_score?: number | null
          confidence?: number | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          image_url: string
          notes?: string | null
          overall_score?: number | null
          patient_id: string
          primary_vein_score?: number | null
          secondary_vein_score?: number | null
        }
        Update: {
          avoid_vein_score?: number | null
          confidence?: number | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          image_url?: string
          notes?: string | null
          overall_score?: number | null
          patient_id?: string
          primary_vein_score?: number | null
          secondary_vein_score?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "doctor" | "patient" | "nurse"
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
      app_role: ["doctor", "patient", "nurse"],
    },
  },
} as const
