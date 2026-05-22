export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      measurements: {
        Row: {
          id: string
          user_id: string
          systolic: number
          diastolic: number
          pulse: number
          measured_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          systolic: number
          diastolic: number
          pulse: number
          measured_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          systolic?: number
          diastolic?: number
          pulse?: number
          measured_at?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
