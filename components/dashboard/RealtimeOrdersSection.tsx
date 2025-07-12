import React, { useState, useEffect } from 'react'
import { supabase, Order } from '../../lib/supabase'
import Card from '../ui/Card'
import { ClockIcon } from '../icons/ClockIcon'
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon'

const RealtimeOrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期データ取得
    fetchOrders()

    // リアルタイム購読設定
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('新規注文受信:', payload.new)
          setOrders(prev => [payload.new as Order, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('注文データ取得エラー:', error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '受付中'
      case 'confirmed': return '確認済'
      default: return status
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">リアルタイム注文</h3>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">注文データを読み込み中...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">リアルタイム注文</h3>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>自動更新</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ注文がありません</p>
            <p className="text-sm text-gray-400 mt-1">LINEからの注文があると、ここにリアルタイムで表示されます</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{order.client_name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{formatTime(order.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{order.product_name}</span>
                    <span className="ml-2">{order.quantity}{order.unit}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    #{order.order_number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default RealtimeOrdersSection 