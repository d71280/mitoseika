import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ProductDetailData, ProductUnit } from '../../types';
import { CubeIcon } from '../icons/CubeIcon';
import { CurrencyYenIcon } from '../icons/CurrencyYenIcon';
import { ArrowUpRightDotsIcon } from '../icons/ArrowUpRightDotsIcon';
import { TableCellsIcon } from '../icons/TableCellsIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';

interface ProductAnalysisDetailPageProps {
  productId: string;
  onNavigateBack: () => void;
}

// Mock data fetching function
const fetchProductDetails = async (id: string): Promise<ProductDetailData | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  if (id === 'prod_cabbage') {
    return {
      id: 'prod_cabbage',
      name: 'キャベツ',
      category: '葉物野菜',
      avgPrice: 150, // per item
      profitMargin: 28, // percentage
      totalSalesLast30d: 1250, // items
      salesTrend: [
        { date: '2024-07-01', sales: 40 }, { date: '2024-07-08', sales: 55 },
        { date: '2024-07-15', sales: 45 }, { date: '2024-07-22', sales: 60 },
      ],
      clientComposition: [
        { clientId: 'client_AStore', clientName: 'A商店', percentage: 60 },
        { clientId: 'client_BDiner', clientName: 'B食堂', percentage: 25 },
        { clientId: 'other', clientName: 'その他', percentage: 15 },
      ],
      inventoryHistory: [
        { date: '2024-07-20', event: '仕入', quantity: 200, notes: 'XXファームより' },
        { date: '2024-07-22', event: '調整', quantity: -5, notes: '廃棄' },
        { date: '2024-07-25', event: '仕入', quantity: 150, notes: 'YY農園より' },
      ],
    };
  }
  if (id === 'prod_tomato') {
     return {
      id: 'prod_tomato',
      name: 'トマト',
      category: '果菜類',
      avgPrice: 500, // per box
      profitMargin: 32, // percentage
      totalSalesLast30d: 800, // boxes
      salesTrend: [
        { date: '2024-07-01', sales: 20 }, { date: '2024-07-08', sales: 25 },
        { date: '2024-07-15', sales: 30 }, { date: '2024-07-22', sales: 22 },
      ],
      clientComposition: [
        { clientId: 'client_AStore', clientName: 'A商店', percentage: 40 },
        { clientId: 'client_BDiner', clientName: 'B食堂', percentage: 35 },
        { clientId: 'other', clientName: 'その他', percentage: 25 },
      ],
      inventoryHistory: [
        { date: '2024-07-19', event: '仕入', quantity: 100, notes: 'トマト園より' },
        { date: '2024-07-23', event: '調整', quantity: -2, notes: '品質不良' },
      ],
    };   
  }
  return null;
};


const ProductAnalysisDetailPage: React.FC<ProductAnalysisDetailPageProps> = ({ productId, onNavigateBack }) => {
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductDetails(productId).then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">詳細データを読み込み中...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
        <Button onClick={onNavigateBack} variant="ghost" size="sm" className="mb-4 text-green-700 hover:text-green-800">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          分析一覧へ戻る
        </Button>
        <p className="text-center text-red-600">商品データが見つかりませんでした。</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-gray-300">
        <div className="flex items-center">
          <CubeIcon className="w-8 h-8 text-green-700 mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800">{product.name} 詳細分析</h1>
        </div>
        <Button onClick={onNavigateBack} variant="ghost" size="sm" className="text-green-700 hover:text-green-800">
          <ArrowLeftIcon className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">分析一覧へ</span>戻る
        </Button>
      </header>

      {/* Key Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <CurrencyYenIcon className="w-6 h-6 mr-2 text-green-600" /> 主要指標
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricDisplay label="カテゴリ" value={product.category} />
          <MetricDisplay label="平均販売価格" value={`¥${product.avgPrice.toLocaleString()}`} />
          <MetricDisplay label="平均粗利率" value={`${product.profitMargin}%`} />
          <MetricDisplay label="総販売数 (直近30日)" value={`${product.totalSalesLast30d.toLocaleString()} ${product.name === 'トマト' ? ProductUnit.BOX : ProductUnit.ITEM}`} />
        </div>
      </section>

      {/* Sales Trend Chart */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ArrowUpRightDotsIcon className="w-6 h-6 mr-2 text-blue-600" /> 売上トレンド (週別)
        </h2>
        <Card className="bg-slate-50 p-4 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-500">【{product.name}の売上トレンドグラフのプレースホルダー】</p>
          {/* TODO: Implement actual chart */}
        </Card>
      </section>
      
      {/* Client Composition Table */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <TableCellsIcon className="w-6 h-6 mr-2 text-purple-600" /> 顧客別売上構成 (直近30日)
        </h2>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">構成比</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.clientComposition.map(client => (
                <tr key={client.clientId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{client.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{client.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory History */}
       <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ClipboardListIcon className="w-6 h-6 mr-2 text-orange-600" /> 在庫・仕入れ履歴 (一部抜粋)
        </h2>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">イベント</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.inventoryHistory.map((entry, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{entry.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.event}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${entry.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{entry.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.notes}</td>
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

export default ProductAnalysisDetailPage;