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
  process.env.SUPABASE_URL || 'https://ijifjbbyyccwhghzvwsb.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaWZqYmJ5eWNjd2hnaHp2d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTYzNjcsImV4cCI6MjA2NzE3MjM2N30.1WDbqqSrcW4k82HwSf0uhuS-gQbqusrgFiEiY_qKehM'
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

// サーバー起動
app.listen(port, () => {
  console.log(`🚀 LINE Bot Webhook Server is running on port ${port}`)
  console.log(`📡 Webhook URL: http://localhost:${port}/webhook`)
  console.log(`📊 Health check: http://localhost:${port}/`)
}) 