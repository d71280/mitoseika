import React from 'react';
import Card from '../ui/Card';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';

interface OrderItem {
  id: string;
  productName: string;
  orderQuantity: number;
  currentStock: number;
  requiredOrder: number;
  unit: string;
}

const TodaysOrdersSection: React.FC = () => {
  const todaysOrders: OrderItem[] = [
    {
      id: '1',
      productName: 'じゃがいも（メークイン）',
      orderQuantity: 125,
      currentStock: 49,
      requiredOrder: 76,
      unit: 'kg'
    },
    {
      id: '2',
      productName: '人参',
      orderQuantity: 75,
      currentStock: 59,
      requiredOrder: 16,
      unit: 'kg'
    },
    {
      id: '3',
      productName: 'キャベツ',
      orderQuantity: 98,
      currentStock: 98,
      requiredOrder: 0,
      unit: '個'
    },
    {
      id: '4',
      productName: 'トマト',
      orderQuantity: 20,
      currentStock: 20,
      requiredOrder: 0,
      unit: '箱'
    },
    {
      id: '5',
      productName: '玉ねぎ',
      orderQuantity: 51,
      currentStock: 51,
      requiredOrder: 0,
      unit: 'kg'
    },
    {
      id: '6',
      productName: 'レタス',
      orderQuantity: 104,
      currentStock: 104,
      requiredOrder: 0,
      unit: '個'
    },
    {
      id: '7',
      productName: 'きゅうり',
      orderQuantity: 53,
      currentStock: 53,
      requiredOrder: 0,
      unit: 'ケース'
    },
    {
      id: '8',
      productName: '白菜',
      orderQuantity: 83,
      currentStock: 83,
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
            {todaysOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-gray-800">{order.productName}</td>
                <td className="border border-gray-300 py-3 px-4 text-center text-gray-700">
                  {order.orderQuantity}{order.unit}
                </td>
                <td className="border border-gray-300 py-3 px-4 text-center text-gray-700">
                  {order.currentStock}{order.unit}
                </td>
                <td className="border border-gray-300 py-3 px-4 text-center">
                  <span className={`font-semibold ${order.requiredOrder > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {order.requiredOrder > 0 ? `${order.requiredOrder}${order.unit}` : `0${order.unit}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TodaysOrdersSection;