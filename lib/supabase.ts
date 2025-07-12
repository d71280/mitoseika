import { createClient } from '@supabase/supabase-js'

// Supabase設定（実際の認証情報）
const supabaseUrl = 'https://exmpbeheepptuippyoby.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bXBiZWhlZXBwdHVpcHB5b2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODg4NjksImV4cCI6MjA2Nzg2NDg2OX0.boGrurZvcoQmGVoBQPpAAw_tuXF3B4K4--I2rF_jqGA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース型定義
export interface Order {
  id: string
  order_number: string
  client_name: string
  product_name: string
  quantity: number
  unit: string
  line_message_id?: string
  status: string
  created_at: string
}

export interface LineMessage {
  id: string
  line_user_id: string
  message_text: string
  order_id?: string
  received_at: string
} 