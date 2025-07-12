import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface LineWebhookSimulatorProps {}

// 注文メッセージを解析する関数
function parseOrderMessage(text: string) {
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

export const LineWebhookSimulator: React.FC<LineWebhookSimulatorProps> = () => {
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('U1234567890abcdef')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsProcessing(true)
    setLastResult(null)

    try {
      console.log('Processing LINE message:', message)

      // 1. メッセージをline_messagesテーブルに保存
      const { error: messageError } = await supabase
        .from('line_messages')
        .insert({
          line_user_id: userId,
          message_text: message,
          received_at: new Date().toISOString()
        })

      if (messageError) {
        console.error('Error saving LINE message:', messageError)
        setLastResult(`メッセージ保存エラー: ${messageError.message}`)
        return
      }

      // 2. 注文メッセージを解析
      const orderData = parseOrderMessage(message)

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
          setLastResult(`注文保存エラー: ${orderError.message}`)
        } else {
          console.log('Order saved successfully')
          setLastResult(`✅ 注文処理成功: ${orderData.product} ${orderData.quantity}個`)
        }
      } else {
        console.log('Message does not match order pattern')
        setLastResult(`📝 メッセージを記録しました（注文パターンではありません）`)
      }

      // メッセージをクリア
      setMessage('')

    } catch (error) {
      console.error('Error processing message:', error)
      setLastResult(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">LINE Bot シミュレーター</h3>
        <span className="text-sm text-gray-500">デモ用</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LINE ユーザーID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="U1234567890abcdef"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メッセージ
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="りんご 10個"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            例: "りんご 10個", "みかん 5", "バナナ20"
          </p>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={isProcessing || !message.trim()}
          className="w-full"
        >
          {isProcessing ? '処理中...' : 'LINEメッセージ送信'}
        </Button>

        {lastResult && (
          <div className={`p-3 rounded-md text-sm ${
            lastResult.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : lastResult.includes('📝')
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {lastResult}
          </div>
        )}
      </div>
    </Card>
  )
} 