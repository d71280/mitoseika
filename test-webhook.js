// LINE Webhook テスト用スクリプト
const testMessage = {
  events: [
    {
      type: 'message',
      message: {
        type: 'text',
        text: 'りんご 10個'  // テスト注文メッセージ
      },
      source: {
        userId: 'U1234567890abcdef'
      },
      replyToken: 'dummy-reply-token',
      timestamp: Date.now()
    }
  ]
}

// Webhookエンドポイントにテストリクエストを送信
fetch('http://localhost:3001/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Line-Signature': 'dummy-signature'
  },
  body: JSON.stringify(testMessage)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Webhook test response:', data)
})
.catch(error => {
  console.error('❌ Webhook test failed:', error)
}) 