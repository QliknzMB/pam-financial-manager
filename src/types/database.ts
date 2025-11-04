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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          account_number: string | null
          account_type: 'checking' | 'savings' | 'credit_card' | 'bucket'
          is_shared: boolean
          current_balance: number
          institution: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          account_number?: string | null
          account_type: 'checking' | 'savings' | 'credit_card' | 'bucket'
          is_shared?: boolean
          current_balance?: number
          institution?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          account_number?: string | null
          account_type?: 'checking' | 'savings' | 'credit_card' | 'bucket'
          is_shared?: boolean
          current_balance?: number
          institution?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          date: string
          amount: number
          payee: string
          particulars: string | null
          code: string | null
          reference: string | null
          transaction_type: string | null
          category_id: string | null
          notes: string | null
          needs_review: boolean
          review_reason: string | null
          is_recurring: boolean
          recurring_frequency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          date: string
          amount: number
          payee: string
          particulars?: string | null
          code?: string | null
          reference?: string | null
          transaction_type?: string | null
          category_id?: string | null
          notes?: string | null
          needs_review?: boolean
          review_reason?: string | null
          is_recurring?: boolean
          recurring_frequency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          date?: string
          amount?: number
          payee?: string
          particulars?: string | null
          code?: string | null
          reference?: string | null
          transaction_type?: string | null
          category_id?: string | null
          notes?: string | null
          needs_review?: boolean
          review_reason?: string | null
          is_recurring?: boolean
          recurring_frequency?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          parent_category_id: string | null
          is_system: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          parent_category_id?: string | null
          is_system?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          parent_category_id?: string | null
          is_system?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          month: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          month: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          month?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      categorization_rules: {
        Row: {
          id: string
          user_id: string
          payee_pattern: string
          category_id: string
          confidence: number
          times_applied: number
          times_confirmed: number
          times_corrected: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          payee_pattern: string
          category_id: string
          confidence?: number
          times_applied?: number
          times_confirmed?: number
          times_corrected?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          payee_pattern?: string
          category_id?: string
          confidence?: number
          times_applied?: number
          times_confirmed?: number
          times_corrected?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categorization_attempts: {
        Row: {
          id: string
          transaction_id: string
          suggested_category_id: string
          confidence: number
          reasoning: string | null
          user_approved: boolean | null
          user_action: string | null
          actual_category_id: string | null
          model_used: string
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          suggested_category_id: string
          confidence: number
          reasoning?: string | null
          user_approved?: boolean | null
          user_action?: string | null
          actual_category_id?: string | null
          model_used: string
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          suggested_category_id?: string
          confidence?: number
          reasoning?: string | null
          user_approved?: boolean | null
          user_action?: string | null
          actual_category_id?: string | null
          model_used?: string
          created_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string
          payee: string
          expected_amount: number
          frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual'
          next_expected_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id: string
          payee: string
          expected_amount: number
          frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual'
          next_expected_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string
          payee?: string
          expected_amount?: number
          frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual'
          next_expected_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string | null
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
      account_type: 'checking' | 'savings' | 'credit_card' | 'bucket'
      category_type: 'income' | 'expense'
      transaction_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual'
    }
  }
}
