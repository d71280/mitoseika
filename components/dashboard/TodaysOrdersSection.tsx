import React from 'react';
import Card from '../ui/Card';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';

interface OrderItem {
  id: string;
  productName: string;
  orderCount: number;
  currentStock: number;
  requiredOrder: number;
  unit: string;
}

const TodaysOrdersSection: React.FC = () => {
  const todaysOrders: OrderItem[] = [
    {
      id: '1',
      productName: 'ジャガ苋（メークイン）',
      orderCount: 1,
      currentStock: 58,
      requiredOrder: 67,
      unit: 'kg'
    },
    {
      id: '2',
      productName: 'キャベツ',
      orderCount: 1,
      currentStock: 23,
      requiredOrder: 15,
      unit: '個'
    },
    {
      id: '3',
      productName: 'トマト',
      orderCount: 1,
      currentStock: 88,
      requiredOrder: 0,
      unit: '個'
    },
    {
      id: '4',
      productName: '大根',
      orderCount: 1,
      currentStock: 78,
      requiredOrder: 0,
      unit: '箱'
    },
    {
      id: '5',
      productName: '白菜',
      orderCount: 1,
      currentStock: 60,
      requiredOrder: 0,
      unit: 'kg'
    },
    {
      id: '6',
      productName: '人参',
      orderCount: 1,
      currentStock: 75,
      requiredOrder: 0,
      unit: 'kg'
    },
    {
      id: '7',
      productName: 'ブロッコリー',
      orderCount: 1,
      currentStock: 81,
      requiredOrder: 0,
      unit: 'ケース'
    },
    {
      id: '8',
      productName: 'れんこん',
      orderCount: 1,
      currentStock: 25,
      requiredOrder: 0,
      unit: '個'
    }
  ];

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ShoppingCartIcon className="w-6 h-6 mr-2 text-blue-600" />
        本日の注文一覧
      </h2>
      <div className="space-y-3">
        {todaysOrders.map((order) => (
          <div key={order.id} className={`border-l-4 rounded p-4 transition-colors ${
            order.requiredOrder > 0 
              ? 'bg-red-50 border-red-600 hover:bg-red-100' 
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">{order.productName}</h3>
              <div className="flex gap-6 items-center">
                <span className="text-gray-700">
                  注文数: <span className="font-medium">{order.orderCount}回</span>
                </span>
                <span className="text-gray-700">
                  現在在庫: <span className="font-medium">{order.currentStock}{order.unit}</span>
                </span>
                <span className={`text-lg font-semibold ${
                  order.requiredOrder > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  要仕入数: {order.requiredOrder > 0 ? (
                    <span>{order.requiredOrder}{order.unit}</span>
                  ) : (
                    <span>0{order.unit}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TodaysOrdersSection;