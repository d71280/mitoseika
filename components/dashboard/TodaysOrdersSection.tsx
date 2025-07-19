import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Order, fetchOrdersWithDetails } from '../../lib/supabase';
import Card from '../ui/Card';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';

interface TodaysOrderItem {
  productName: string;
  orderQuantity: number;
  currentStock: number;
  requiredOrder: number;
  unit: string;
  orderCount: number;
}

const TodaysOrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  const fetchTodaysOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await fetchOrdersWithDetails(100);
      
      // 今日の注文のみをフィルタリング
      const today = new Date().toISOString().split('T')[0];
      const todaysOrders = allOrders.filter(order => 
        order.order_date === today || order.created_at.split('T')[0] === today
      );
      
      setOrders(todaysOrders);
    } catch (error) {
      console.error('今日の注文データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 商品別の集計データを計算
  const todaysOrderItems = useMemo((): TodaysOrderItem[] => {
    const productMap = new Map<string, {
      productName: string;
      totalQuantity: number;
      unit: string;
      orderCount: number;
    }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productMap.has(item.product_name)) {
          productMap.set(item.product_name, {
            productName: item.product_name,
            totalQuantity: 0,
            unit: item.unit,
            orderCount: 0
          });
        }

        const productData = productMap.get(item.product_name)!;
        productData.totalQuantity += item.quantity;
        productData.orderCount += 1;
      });
    });

    return Array.from(productMap.values()).map(product => {
      const currentStock = Math.floor(Math.random() * 100) + 20; // 仮の在庫数
      const safetyStock = Math.ceil(product.totalQuantity * 1.2); // 安全在庫
      const requiredOrder = Math.max(0, product.totalQuantity + safetyStock - currentStock);
      
      return {
        productName: product.productName,
        orderQuantity: product.totalQuantity,
        currentStock,
        requiredOrder,
        unit: product.unit,
        orderCount: product.orderCount
      };
    }).sort((a, b) => b.orderQuantity - a.orderQuantity);
  }, [orders]);

  if (loading) {
    return (
      <Card className="bg-white p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <ShoppingCartIcon className="w-6 h-6 mr-2 text-blue-600" />
          本日の注文一覧
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">データを読み込み中...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ShoppingCartIcon className="w-6 h-6 mr-2 text-blue-600" />
        本日の注文一覧 ({orders.length}件の注文)
      </h2>
      
      {todaysOrderItems.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">今日はまだ注文がありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 py-3 px-4 text-left font-medium text-gray-700">商品名</th>
                <th className="border border-gray-300 bg-gray-100 py-3 px-4 text-center font-medium text-gray-700">注文数</th>
                <th className="border border-gray-300 bg-gray-100 py-3 px-4 text-center font-medium text-gray-700">現在在庫</th>
                <th className="border border-gray-300 bg-gray-100 py-3 px-4 text-center font-medium text-gray-700">要仕入数</th>
              </tr>
            </thead>
            <tbody>
              {todaysOrderItems.map((item, index) => (
                <tr key={item.productName} className="hover:bg-gray-50">
                  <td className="border border-gray-300 py-3 px-4 text-gray-800">
                    {item.productName}
                    <span className="text-xs text-gray-500 ml-2">({item.orderCount}回注文)</span>
                  </td>
                  <td className="border border-gray-300 py-3 px-4 text-center text-gray-700">
                    {item.orderQuantity.toLocaleString()}{item.unit}
                  </td>
                  <td className="border border-gray-300 py-3 px-4 text-center text-gray-700">
                    {item.currentStock.toLocaleString()}{item.unit}
                  </td>
                  <td className="border border-gray-300 py-3 px-4 text-center">
                    <span className={`font-semibold ${item.requiredOrder > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.requiredOrder > 0 ? `${item.requiredOrder.toLocaleString()}${item.unit}` : `0${item.unit}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default TodaysOrdersSection;