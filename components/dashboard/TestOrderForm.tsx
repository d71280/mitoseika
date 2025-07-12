import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../ui/Card'
import { PlusCircleIcon } from '../icons/PlusCircleIcon'

const TestOrderForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    productName: '',
    quantity: 1,
    unit: '個'
  })

  const generateOrderNumber = () => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.getTime().toString().slice(-4)
    return `ORD-${dateStr}-${timeStr}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderNumber = generateOrderNumber()
      
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            client_name: formData.clientName,
            product_name: formData.productName,
            quantity: formData.quantity,
            unit: formData.unit,
            status: 'pending',
            line_message_id: `test-${Date.now()}`
          }
        ])
        .select()

      if (error) {
        console.error('注文追加エラー:', error)
        alert('注文の追加に失敗しました')
      } else {
        console.log('注文追加成功:', data)
        alert('注文が正常に追加されました！')
        // フォームリセット
        setFormData({
          clientName: '',
          productName: '',
          quantity: 1,
          unit: '個'
        })
      }
    } catch (error) {
      console.error('エラー:', error)
      alert('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const quickOrders = [
    { clientName: 'A商店', productName: 'キャベツ', quantity: 10, unit: '個' },
    { clientName: 'B食堂', productName: 'トマト', quantity: 5, unit: '箱' },
    { clientName: 'C青果店', productName: '玉ねぎ', quantity: 20, unit: 'kg' }
  ]

  const handleQuickOrder = (order: typeof quickOrders[0]) => {
    setFormData(order)
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PlusCircleIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">テスト注文追加</h3>
          <span className="text-sm text-gray-500">（デモ用）</span>
        </div>

        {/* クイック注文ボタン */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">クイック注文:</p>
          <div className="flex flex-wrap gap-2">
            {quickOrders.map((order, index) => (
              <button
                key={index}
                onClick={() => handleQuickOrder(order)}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-colors"
              >
                {order.clientName} - {order.productName} {order.quantity}{order.unit}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                顧客名
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: A商店"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: キャベツ"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="個">個</option>
                <option value="箱">箱</option>
                <option value="ケース">ケース</option>
                <option value="kg">kg</option>
                <option value="セット">セット</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? '追加中...' : '注文を追加'}
          </button>
        </form>
      </div>
    </Card>
  )
}

export default TestOrderForm 