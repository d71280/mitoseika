import React, { useState, useEffect, useMemo } from 'react'
import { supabase, Order } from '../../lib/supabase'
import Card from '../ui/Card'
import { ClockIcon } from '../icons/ClockIcon'
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon'
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon'

interface PurchaseAnalysisData {
  productName: string;
  totalDemand: number;
  currentStock: number;
  requiredPurchase: number;
  orderCount: number;
  unit: string;
}

const RealtimeOrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'orders' | 'analysis'>('orders')

  // 仕入れ分析データの計算
  const purchaseAnalysisData = useMemo((): PurchaseAnalysisData[] => {
    const productMap = new Map<string, {
      productName: string;
      totalDemand: number;
      currentStock: number;
      requiredPurchase: number;
      orderCount: number;
      unit: string;
    }>();

    orders.forEach(order => {
      if (!productMap.has(order.product_name)) {
        productMap.set(order.product_name, {
          productName: order.product_name,
          totalDemand: 0,
          currentStock: Math.floor(Math.random() * 100) + 20, // 仮の在庫数（20-120）
          requiredPurchase: 0,
          orderCount: 0,
          unit: order.unit || '個'
        });
      }

      const productData = productMap.get(order.product_name)!;
      productData.totalDemand += order.quantity;
      productData.orderCount += 1;
    });

    // 必要仕入数を計算
    return Array.from(productMap.values()).map(product => {
      const averageOrderQuantity = product.totalDemand / product.orderCount;
      const safetyStock = Math.ceil(averageOrderQuantity * 1.5); // 安全在庫は平均注文数の1.5倍
      const requiredPurchase = Math.max(0, product.totalDemand + safetyStock - product.currentStock);
      
      return {
        ...product,
        requiredPurchase
      };
    }).sort((a, b) => b.requiredPurchase - a.requiredPurchase);
  }, [orders]);

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
        .limit(50) // 分析用により多くのデータを取得

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
      case 'received': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '受付中'
      case 'confirmed': return '確認済'
      case 'received': return '受信済'
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
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>自動更新</span>
            </div>
          </div>
        </div>

        {/* 表示モード切り替えボタン */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'orders' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            注文一覧
          </button>
          <button
            onClick={() => setViewMode('analysis')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'analysis' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            仕入れ分析
          </button>
        </div>

        {viewMode === 'orders' ? (
          // 注文一覧表示
          orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">まだ注文がありません</p>
              <p className="text-sm text-gray-400 mt-1">LINEからの注文があると、ここにリアルタイムで表示されます</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.slice(0, 10).map((order) => (
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
          )
        ) : (
          // 仕入れ分析表示
          purchaseAnalysisData.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">分析データがありません</p>
              <p className="text-sm text-gray-400 mt-1">注文があると仕入れ分析が表示されます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 仕入れ必要商品のアラート */}
              {purchaseAnalysisData.filter(p => p.requiredPurchase > 0).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">仕入れが必要な商品</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {purchaseAnalysisData.filter(p => p.requiredPurchase > 0).length}種類の商品で仕入れが必要です
                  </p>
                </div>
              )}

              {/* 商品別仕入れ分析テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium">商品名</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium">注文数</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium">在庫数</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium">要仕入数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseAnalysisData.map((item, index) => (
                      <tr key={item.productName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{item.productName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                          {item.totalDemand.toLocaleString()}{item.unit}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                          {item.currentStock.toLocaleString()}{item.unit}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                          <span className={item.requiredPurchase > 0 ? 'font-bold text-red-600' : 'text-green-600'}>
                            {item.requiredPurchase > 0 ? item.requiredPurchase.toLocaleString() : '0'}{item.unit}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  )
}

export default RealtimeOrdersSection 