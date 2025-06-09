export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      budgets: {
        Row: {
          id: string
          amount: number
          period: 'daily' | 'monthly'
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          amount: number
          period: 'daily' | 'monthly'
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          amount?: number
          period?: 'daily' | 'monthly'
          created_at?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          user_id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          amount: number
          category_id: string
          description: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          amount: number
          category_id: string
          description: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          amount?: number
          category_id?: string
          description?: string
          created_at?: string
          user_id?: string
        }
      }
      feedback: {
        Row: {
          id: string
          message: string
          rating: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          rating: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          rating?: number
          created_at?: string
          user_id?: string
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