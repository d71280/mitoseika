import { createClient } from '@supabase/supabase-js'

// Supabase設定（server.jsから取得）
const SUPABASE_URL = 'https://ijifjbbyyccwhghzvwsb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaWZqYmJ5eWNjd2hnaHp2d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTYzNjcsImV4cCI6MjA2NzE3MjM2N30.1WDbqqSrcW4k82HwSf0uhuS-gQbqusrgFiEiY_qKehM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function deleteAllDemoData() {
  console.log('🗑️  デモデータ削除スクリプトを開始します...')
  
  try {
    // 関連テーブルを依存関係の逆順で削除
    const tables = [
      'purchase_calculations',
      'inventory_transactions', 
      'order_items',
      'orders',
      'line_messages',
      'price_history',
      'products',
      'clients',
      'suppliers'
    ]
    
    for (const table of tables) {
      console.log(`📋 ${table} テーブルのデータを削除中...`)
      
      // 既存データ数をカウント
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.log(`❌ ${table} テーブルのカウントエラー:`, countError.message)
        continue
      }
      
      console.log(`📊 ${table}: ${count || 0}件のデータが存在`)
      
      if (count && count > 0) {
        // 全データを削除
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // 存在しないIDで全削除
        
        if (deleteError) {
          console.log(`❌ ${table} テーブルの削除エラー:`, deleteError.message)
        } else {
          console.log(`✅ ${table} テーブルのデータを削除完了`)
        }
      } else {
        console.log(`ℹ️  ${table} テーブルは既に空です`)
      }
    }
    
    console.log('🎉 全てのデモデータの削除が完了しました！')
    
    // 削除後の確認
    console.log('\n📊 削除後の確認:')
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`${table}: ${count || 0}件`)
      }
    }
    
  } catch (error) {
    console.error('❌ 削除処理中にエラーが発生しました:', error)
  }
}

// 確認プロンプト
console.log('⚠️  このスクリプトは全てのデモデータを削除します。')
console.log('⚠️  本番データがある場合は十分注意してください。')
console.log('\n続行するには以下を実行してください:')
console.log('node delete_demo_data.js')

// 実行
deleteAllDemoData()