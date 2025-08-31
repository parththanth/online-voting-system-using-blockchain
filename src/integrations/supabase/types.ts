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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_public_metrics: {
        Row: {
          hourly_activity: Json
          id: number
          partywise_votes: Json
          total_registered_voters: number
          total_votes_cast: number
          updated_at: string
          voter_turnout_percentage: number
        }
        Insert: {
          hourly_activity?: Json
          id?: number
          partywise_votes?: Json
          total_registered_voters?: number
          total_votes_cast?: number
          updated_at?: string
          voter_turnout_percentage?: number
        }
        Update: {
          hourly_activity?: Json
          id?: number
          partywise_votes?: Json
          total_registered_voters?: number
          total_votes_cast?: number
          updated_at?: string
          voter_turnout_percentage?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      face_enrollment: {
        Row: {
          confidence_threshold: number | null
          created_at: string
          enrolled_by: string | null
          enrollment_date: string
          face_descriptor: Json
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_threshold?: number | null
          created_at?: string
          enrolled_by?: string | null
          enrollment_date?: string
          face_descriptor: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_threshold?: number | null
          created_at?: string
          enrolled_by?: string | null
          enrollment_date?: string
          face_descriptor?: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_enrollment_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      face_verification_attempts: {
        Row: {
          confidence_score: number | null
          id: string
          ip_address: unknown | null
          liveness_check_passed: boolean | null
          success: boolean
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          id?: string
          ip_address?: unknown | null
          liveness_check_passed?: boolean | null
          success: boolean
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          id?: string
          ip_address?: unknown | null
          liveness_check_passed?: boolean | null
          success?: boolean
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "face_verification_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string
          document_path: string
          encrypted: boolean
          encryption_iv: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_path: string
          encrypted?: boolean
          encryption_iv?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_path?: string
          encrypted?: boolean
          encryption_iv?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          attempts: number | null
          blocked_until: string | null
          email: string
          id: string
          ip_address: unknown
          phone_number: string | null
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          blocked_until?: string | null
          email: string
          id?: string
          ip_address: unknown
          phone_number?: string | null
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          blocked_until?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          phone_number?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          details: Json | null
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          timestamp: string | null
          type: Database["public"]["Enums"]["alert_type"]
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_phone: string | null
        }
        Insert: {
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          timestamp?: string | null
          type: Database["public"]["Enums"]["alert_type"]
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Update: {
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          timestamp?: string | null
          type?: Database["public"]["Enums"]["alert_type"]
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_locked_until: string | null
          created_at: string | null
          email: string | null
          face_embedding: Json | null
          face_verified: boolean | null
          failed_otp_attempts: number | null
          has_voted: boolean | null
          id: string
          last_otp_request: string | null
          otp_expires: string | null
          otp_hash: string | null
          otp_verified: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string | null
          email?: string | null
          face_embedding?: Json | null
          face_verified?: boolean | null
          failed_otp_attempts?: number | null
          has_voted?: boolean | null
          id?: string
          last_otp_request?: string | null
          otp_expires?: string | null
          otp_hash?: string | null
          otp_verified?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string | null
          email?: string | null
          face_embedding?: Json | null
          face_verified?: boolean | null
          failed_otp_attempts?: number | null
          has_voted?: boolean | null
          id?: string
          last_otp_request?: string | null
          otp_expires?: string | null
          otp_hash?: string | null
          otp_verified?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          blockchain_confirmed: boolean | null
          id: string
          party_id: string
          party_name: string
          timestamp: string | null
          tx_hash: string | null
          user_id: string | null
          vote_hash: string
        }
        Insert: {
          blockchain_confirmed?: boolean | null
          id?: string
          party_id: string
          party_name: string
          timestamp?: string | null
          tx_hash?: string | null
          user_id?: string | null
          vote_hash: string
        }
        Update: {
          blockchain_confirmed?: boolean | null
          id?: string
          party_id?: string
          party_name?: string
          timestamp?: string | null
          tx_hash?: string | null
          user_id?: string | null
          vote_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_schedule: {
        Row: {
          id: number
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
          voting_end: string | null
          voting_start: string | null
        }
        Insert: {
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          voting_end?: string | null
          voting_start?: string | null
        }
        Update: {
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          voting_end?: string | null
          voting_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voting_schedule_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_account_locked: {
        Args: { user_id: string }
        Returns: boolean
      }
      recompute_admin_public_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      alert_type:
        | "otp_failure"
        | "face_verify_failure"
        | "duplicate_vote"
        | "suspicious_ip"
      user_role: "voter" | "admin"
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
      alert_type: [
        "otp_failure",
        "face_verify_failure",
        "duplicate_vote",
        "suspicious_ip",
      ],
      user_role: ["voter", "admin"],
    },
  },
} as const
