import { createClient } from '@supabase/supabase-js'

// Supabase設定（実際の認証情報）
const supabaseUrl = 'https://exmpbeheepptuippyoby.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bXBiZWhlZXBwdHVpcHB5b2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODg4NjksImV4cCI6MjA2Nzg2NDg2OX0.boGrurZvcoQmGVoBQPpAAw_tuXF3B4K4--I2rF_jqGA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース型定義（データベーススキーマに合わせて修正）
export interface DatabaseOrder {
  id: string
  order_number: string
  client_id: string
  order_date: string
  delivery_date?: string
  status: string
  sub_total?: number
  tax_rate?: number
  tax_amount?: number
  total_amount?: number
  notes?: string
  delivery_notes?: string
  line_message_id?: string
  created_at: string
  updated_at: string
}

export interface DatabaseOrderItem {
  id: string
  order_id: string
  item_number: number
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface DatabaseClient {
  id: string
  customer_id?: string
  company_name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  line_user_id?: string
  rule_summary?: string
  payment_terms: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseProduct {
  id: string
  name: string
  category: string
  unit: string
  purchase_price?: number
  sale_price?: number
  supplier_id?: string
  seasonality?: string[]
  current_stock: number
  low_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 表示用の統合されたOrder型
export interface Order {
  id: string
  order_number: string
  client_name: string
  client_id: string
  order_date: string
  delivery_date?: string
  status: string
  sub_total?: number
  tax_rate?: number
  tax_amount?: number
  total_amount?: number
  notes?: string
  delivery_notes?: string
  line_message_id?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  item_number: number
  product_id: string
  product_name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

export interface LineMessage {
  id: string
  line_user_id: string
  message_text: string
  order_id?: string
  received_at: string
}

// データ取得用のヘルパー関数
export const fetchOrdersWithDetails = async (limit: number = 50): Promise<Order[]> => {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        clients!orders_client_id_fkey(company_name),
        order_items(
          *,
          products!order_items_product_id_fkey(name, unit)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (ordersError) {
      console.error('注文データ取得エラー:', ordersError)
      return []
    }

    // データベースの構造を表示用の構造に変換
    return (ordersData || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      client_id: order.client_id,
      client_name: order.clients?.company_name || '不明な顧客',
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      status: order.status,
      sub_total: order.sub_total,
      tax_rate: order.tax_rate,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      notes: order.notes,
      delivery_notes: order.delivery_notes,
      line_message_id: order.line_message_id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        item_number: item.item_number,
        product_id: item.product_id,
        product_name: item.products?.name || '不明な商品',
        quantity: item.quantity,
        unit: item.products?.unit || '個',
        unit_price: item.unit_price,
        total_price: item.total_price
      }))
    }))
  } catch (error) {
    console.error('データ取得エラー:', error)
    return []
  }
} 