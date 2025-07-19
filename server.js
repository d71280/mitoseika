import express from 'express'
import { middleware, Client } from '@line/bot-sdk'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import dotenv from 'dotenv'

// 環境変数の読み込み
dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// CORS設定
app.use(cors())

// LINE Bot設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'tjcs84emySZ+JPJw/W6Qe0my/VEJs+M7YU1dsAG+o7k0gdR/4NijYCszSy/HQaiiBxpXxhxxSe0TDxcyHuNasKLVIHaI35HU7MyamEuoBkUHIxBxT375MIrgXEUygYXniLbZxmWasScow3m8jz04AwdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '375107527b98cca862b471efd4464e19',
}

const lineClient = new Client(config)

// Supabase設定
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://exmpbeheepptuippyoby.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bXBiZWhlZXBwdHVpcHB5b2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODg4NjksImV4cCI6MjA2Nzg2NDg2OX0.boGrurZvcoQmGVoBQPpAAw_tuXF3B4K4--I2rF_jqGA'
)

// 注文メッセージを解析する関数
function parseOrderMessage(text) {
  // 基本的なパターンマッチング
  // 例: "りんご 10個" または "りんご10" または "りんご 10"
  const patterns = [
    /(.+?)\s*(\d+)個?/,
    /(.+?)\s+(\d+)/,
    /(.+?)(\d+)/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return {
        product: match[1].trim(),
        quantity: parseInt(match[2], 10)
      }
    }
  }
  
  return null
}

// 確認応答メッセージを生成
function createConfirmationMessage(orderData) {
  return {
    type: 'text',
    text: `ご注文ありがとうございます！\n\n📦 商品: ${orderData.product}\n📊 数量: ${orderData.quantity}個\n\n注文を受け付けました。\n処理状況はダッシュボードでご確認いただけます。`
  }
}

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LINE Bot Webhook Server is running',
    timestamp: new Date().toISOString()
  })
})

// LINE Webhook エンドポイント
app.post('/webhook', middleware(config), async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2))

    const events = req.body.events
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const messageText = event.message.text
        const userId = event.source.userId
        const replyToken = event.replyToken
        
        console.log(`Processing message: "${messageText}" from user: ${userId}`)
        
        try {
          // 1. メッセージをline_messagesテーブルに保存
          const { error: messageError } = await supabase
            .from('line_messages')
            .insert({
              line_user_id: userId,
              message_text: messageText,
              received_at: new Date().toISOString()
            })
          
          if (messageError) {
            console.error('Error saving LINE message:', messageError)
          }
          
          // 2. 注文メッセージを解析
          const orderData = parseOrderMessage(messageText)
          
          if (orderData) {
            console.log('Parsed order:', orderData)
            
            // 3. 注文をordersテーブルに保存
            const { error: orderError } = await supabase
              .from('orders')
              .insert({
                client_name: `LINEユーザー ${userId.substring(0, 8)}`,
                product_name: orderData.product,
                quantity: orderData.quantity,
                unit: '個',
                order_number: `LINE-${Date.now()}`,
                status: 'received',
                created_at: new Date().toISOString()
              })
            
            if (orderError) {
              console.error('Error saving order:', orderError)
              // エラーメッセージを返信
              await lineClient.replyMessage(replyToken, {
                type: 'text',
                text: '申し訳ございません。注文の処理中にエラーが発生しました。もう一度お試しください。'
              })
            } else {
              console.log('Order saved successfully')
              // 成功確認メッセージを返信
              await lineClient.replyMessage(replyToken, createConfirmationMessage(orderData))
            }
          } else {
            console.log('Message does not match order pattern')
            // 注文形式でない場合の応答
            await lineClient.replyMessage(replyToken, {
              type: 'text',
              text: 'ご連絡ありがとうございます。\n\n注文の場合は以下の形式でお送りください：\n例: 「りんご 10個」「みかん 5」「バナナ20」\n\nご不明な点がございましたらお気軽にお問い合わせください。'
            })
          }
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          await lineClient.replyMessage(replyToken, {
            type: 'text',
            text: 'システムエラーが発生しました。恐れ入りますが、しばらくしてからもう一度お試しください。'
          })
        }
      }
    }

    res.status(200).json({ success: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

// LIFF注文APIエンドポイント
app.post('/api/orders', express.json(), async (req, res) => {
  try {
    console.log('LIFF Order received:', JSON.stringify(req.body, null, 2))

    const { customerId, customerInfo, items, liffUserId, orderTotal } = req.body

    if (!customerId || !customerInfo || !items || !liffUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: customerId, customerInfo, items, liffUserId' 
      })
    }

    // 注文番号生成
    const orderNumber = `LIFF-${Date.now()}`
    const orderDate = new Date().toISOString().split('T')[0]

    try {
      // 1. メイン注文をordersテーブルに保存
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          client_id: customerInfo.id || null,
          client_name: customerInfo.companyName,
          order_date: orderDate,
          delivery_date: orderDate, // 当日配送として設定
          status: 'pending',
          sub_total: orderTotal.subTotal,
          tax_rate: 0.10,
          tax_amount: orderTotal.taxAmount,
          total_amount: orderTotal.total,
          notes: `LIFF注文 - LINE User: ${liffUserId}`,
          line_message_id: liffUserId
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error saving LIFF order:', orderError)
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save order: ' + orderError.message 
        })
      }

      // 2. 注文明細をorder_itemsテーブルに保存
      const orderItems = items.map((item, index) => ({
        order_id: orderData.id,
        item_number: index + 1,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error saving order items:', itemsError)
        // 注文データも削除してロールバック
        await supabase.from('orders').delete().eq('id', orderData.id)
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save order items: ' + itemsError.message 
        })
      }

      // 3. LIFF注文記録をline_messagesテーブルに保存
      await supabase
        .from('line_messages')
        .insert({
          line_user_id: liffUserId,
          client_id: customerInfo.id || null,
          message_text: `LIFF注文: ${orderNumber}`,
          parsed_data: {
            orderNumber,
            customerId,
            items,
            total: orderTotal.total
          },
          order_id: orderData.id,
          processing_status: 'processed',
          received_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        })

      console.log('LIFF order saved successfully:', orderNumber)

      res.status(200).json({
        success: true,
        orderNumber,
        orderId: orderData.id,
        message: '注文を正常に受け付けました'
      })

    } catch (dbError) {
      console.error('Database error in LIFF order:', dbError)
      res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + dbError.message 
      })
    }

  } catch (error) {
    console.error('LIFF Order API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    })
  }
})

// 顧客情報取得APIエンドポイント
app.get('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params

    const { data: clientData, error } = await supabase
      .from('clients')
      .select('*')
      .eq('customer_id', customerId)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      })
    }

    res.status(200).json({
      success: true,
      customer: clientData
    })

  } catch (error) {
    console.error('Customer API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    })
  }
})

// 商品マスタ管理API
// 商品追加
app.post('/api/products', async (req, res) => {
  try {
    const { name, unit, category, description } = req.body

    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        error: '商品名、単位は必須です'
      })
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, unit, category, description }])
      .select()

    if (error) {
      console.error('Error adding product:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to add product'
      })
    }

    res.status(201).json({
      success: true,
      product: data[0],
      message: '商品を追加しました'
    })

  } catch (error) {
    console.error('Add product API error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    })
  }
})

// 商品更新
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, unit, category, description } = req.body

    const { data, error } = await supabase
      .from('products')
      .update({ name, unit, category, description })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating product:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update product'
      })
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '商品が見つかりません'
      })
    }

    res.status(200).json({
      success: true,
      product: data[0],
      message: '商品を更新しました'
    })

  } catch (error) {
    console.error('Update product API error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    })
  }
})

// 商品削除
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete product'
      })
    }

    res.status(200).json({
      success: true,
      message: '商品を削除しました'
    })

  } catch (error) {
    console.error('Delete product API error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    })
  }
})

// 商品情報取得APIエンドポイント
app.get('/api/products', async (req, res) => {
  try {
    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch products' 
      })
    }

    res.status(200).json({
      success: true,
      products: productsData
    })

  } catch (error) {
    console.error('Products API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    })
  }
})

// サーバー起動
app.listen(port, () => {
  console.log(`🚀 LINE Bot Webhook Server is running on port ${port}`)
  console.log(`📡 Webhook URL: http://localhost:${port}/webhook`)
  console.log(`📊 Health check: http://localhost:${port}/`)
  console.log(`📦 LIFF Order API: http://localhost:${port}/api/orders`)
  console.log(`👥 Customer API: http://localhost:${port}/api/customers/:customerId`)
  console.log(`🛍️ Products API: http://localhost:${port}/api/products`)
}) 