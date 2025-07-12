import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ClientDetailData, OrderStatus, ProductUnit } from '../../types';
import { BuildingStorefrontIcon } from '../icons/BuildingStorefrontIcon';
import { CurrencyYenIcon } from '../icons/CurrencyYenIcon';
import { ArrowUpRightDotsIcon } from '../icons/ArrowUpRightDotsIcon';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';
import { TableCellsIcon } from '../icons/TableCellsIcon';


interface ClientAnalysisDetailPageProps {
  clientId: string;
  onNavigateBack: () => void;
}

// Mock data fetching function
const fetchClientDetails = async (id: string): Promise<ClientDetailData | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  if (id === 'client_AStore') {
    return {
      id: 'client_AStore',
      name: 'A商店',
      totalTransactions90d: 2500000,
      avgOrderValue: 20000,
      orderFrequency: '週3回',
      orderVolumeTrend: [
        { date: '2024-05-01', orders: 10 }, { date: '2024-06-01', orders: 12 },
        { date: '2024-07-01', orders: 15 },
      ],
      mainProducts: [
        { productId: 'prod_cabbage', productName: 'キャベツ', quantity: 300 },
        { productId: 'prod_daikon', productName: '大根', quantity: 150 },
        { productId: 'prod_onion', productName: '玉ねぎ', quantity: 200 },
      ],
      pastOrders: [
        { id: 'ord123', orderDate: '2024-07-25', totalAmount: 22000, status: OrderStatus.DELIVERED },
        { id: 'ord122', orderDate: '2024-07-23', totalAmount: 18000, status: OrderStatus.DELIVERED },
        { id: 'ord121', orderDate: '2024-07-20', totalAmount: 25000, status: OrderStatus.DELIVERED },
      ],
    };
  }
  if (id === 'client_BDiner') {
    return {
      id: 'client_BDiner',
      name: 'B食堂',
      totalTransactions90d: 1800000,
      avgOrderValue: 15000,
      orderFrequency: '週2回',
      orderVolumeTrend: [
        { date: '2024-05-01', orders: 8 }, { date: '2024-06-01', orders: 9 },
        { date: '2024-07-01', orders: 10 },
      ],
      mainProducts: [
        { productId: 'prod_tomato', productName: 'トマト', quantity: 100 },
        { productId: 'prod_lettuce', productName: 'レタス', quantity: 80 },
        { productId: 'prod_onion_small', productName: '小玉ねぎ', quantity: 120 },
      ],
      pastOrders: [
        { id: 'ord203', orderDate: '2024-07-26', totalAmount: 16000, status: OrderStatus.DELIVERED },
        { id: 'ord202', orderDate: '2024-07-22', totalAmount: 14000, status: OrderStatus.DELIVERED },
      ],
    };
  }
  return null;
};

const ClientAnalysisDetailPage: React.FC<ClientAnalysisDetailPageProps> = ({ clientId, onNavigateBack }) => {
  const [client, setClient] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchClientDetails(clientId).then(data => {
      setClient(data);
      setLoading(false);
    });
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">法人詳細データを読み込み中...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
        <Button onClick={onNavigateBack} variant="ghost" size="sm" className="mb-4 text-green-700 hover:text-green-800">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          分析一覧へ戻る
        </Button>
        <p className="text-center text-red-600">法人データが見つかりませんでした。</p>
      </Card>
    );
  }
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'text-green-600 bg-green-100';
      case OrderStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case OrderStatus.CONFIRMED: return 'text-blue-600 bg-blue-100';
      case OrderStatus.CANCELLED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-gray-300">
        <div className="flex items-center">
            <BuildingStorefrontIcon className="w-8 h-8 text-blue-700 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">{client.name} 詳細分析</h1>
        </div>
        <Button onClick={onNavigateBack} variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800">
          <ArrowLeftIcon className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">分析一覧へ</span>戻る
        </Button>
      </header>

      {/* Key Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <CurrencyYenIcon className="w-6 h-6 mr-2 text-blue-600" /> 主要指標
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricDisplay label="総取引額 (直近90日)" value={`¥${client.totalTransactions90d.toLocaleString()}`} />
          <MetricDisplay label="平均注文単価" value={`¥${client.avgOrderValue.toLocaleString()}`} />
          <MetricDisplay label="注文頻度" value={client.orderFrequency} />
        </div>
      </section>

      {/* Order Volume Trend Chart */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ArrowUpRightDotsIcon className="w-6 h-6 mr-2 text-green-600" /> 注文ボリュームトレンド (月別)
        </h2>
        <Card className="bg-slate-50 p-4 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-500">【{client.name}の注文ボリュームトレンドグラフのプレースホルダー】</p>
          {/* TODO: Implement actual chart */}
        </Card>
      </section>

      {/* Main Ordered Products Table */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <TableCellsIcon className="w-6 h-6 mr-2 text-teal-600" /> 主要注文商品 (直近90日)
        </h2>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計数量</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {client.mainProducts.map(product => (
                <tr key={product.productId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Past Order History */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ShoppingCartIcon className="w-6 h-6 mr-2 text-purple-600" /> 最近の注文履歴
        </h2>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計金額</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {client.pastOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">¥{order.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status!)}`}>
                        {order.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </Card>
  );
};

const MetricDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Card className="bg-slate-50 p-3 rounded-md shadow-sm">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </Card>
);

export default ClientAnalysisDetailPage;