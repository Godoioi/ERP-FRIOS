export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { user_id: string; full_name: string | null; default_org: string | null }
        Insert: { user_id: string; full_name?: string | null; default_org?: string | null }
        Update: { user_id?: string; full_name?: string | null; default_org?: string | null }
      }
      profile_orgs: {
        Row: { org_id: string; user_id: string; role: string }
        Insert: { org_id: string; user_id: string; role?: string }
        Update: { org_id?: string; user_id?: string; role?: string }
      }
      orgs: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
      }
      customers: {
        Row: { id: string; org_id: string; name: string; document: string | null }
        Insert: { id?: string; org_id: string; name: string; document?: string | null }
        Update: { id?: string; org_id?: string; name?: string; document?: string | null }
      }
      suppliers: {
        Row: { id: string; org_id: string; name: string; document: string | null }
        Insert: { id?: string; org_id: string; name: string; document?: string | null }
        Update: { id?: string; org_id?: string; name?: string; document?: string | null }
      }
      products: {
        Row: { id: string; org_id: string; name: string; stock_qty: number; sale_price: number }
        Insert: { id?: string; org_id: string; name: string; stock_qty?: number; sale_price?: number }
        Update: { id?: string; org_id?: string; name?: string; stock_qty?: number; sale_price?: number }
      }
      purchases: {
        Row: { id: string; org_id: string; supplier_id: string; total_amount: number }
        Insert: { id?: string; org_id: string; supplier_id: string; total_amount?: number }
        Update: { id?: string; org_id?: string; supplier_id?: string; total_amount?: number }
      }
      sales: {
        Row: { id: string; org_id: string; customer_id: string; total_amount: number }
        Insert: { id?: string; org_id: string; customer_id: string; total_amount?: number }
        Update: { id?: string; org_id?: string; customer_id?: string; total_amount?: number }
      }
      payables: {
        Row: { id: string; org_id: string; amount: number; status: string }
        Insert: { id?: string; org_id: string; amount: number; status?: string }
        Update: { id?: string; org_id?: string; amount?: number; status?: string }
      }
      receivables: {
        Row: { id: string; org_id: string; amount: number; status: string }
        Insert: { id?: string; org_id: string; amount: number; status?: string }
        Update: { id?: string; org_id?: string; amount?: number; status?: string }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
