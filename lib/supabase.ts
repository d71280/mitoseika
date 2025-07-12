import { createClient } from '@supabase/supabase-js'

// Supabase設定（実際の認証情報）
const supabaseUrl = 'https://ijifjbbyyccwhghzvwsb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaWZqYmJ5eWNjd2hnaHp2d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTYzNjcsImV4cCI6MjA2NzE3MjM2N30.1WDbqqSrcW4k82HwSf0uhuS-gQbqusrgFiEiY_qKehM'

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