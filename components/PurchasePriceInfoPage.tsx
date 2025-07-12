import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { CurrencyYenIcon } from './icons/CurrencyYenIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';

interface PriceData {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  marketPrice: number;
  purchasePrice: number;
  salePrice: number;
  priceChange: number; // 前日比
  priceChangePercent: number;
  supplier: string;
  lastUpdated: string;
}

interface PurchasePriceInfoPageProps {}

const PurchasePriceInfoPage: React.FC<PurchasePriceInfoPageProps> = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', '葉物野菜', '果菜類', '根菜類'];

  // モックデータ（実際にはAPIから取得）
  const mockPriceData: PriceData[] = [
    {
      productId: 'prod_cabbage',
      productName: 'キャベツ',
      category: '葉物野菜',
      unit: '個',
      marketPrice: 85,
      purchasePrice: 80,
      salePrice: 150,
      priceChange: 5,
      priceChangePercent: 6.25,
      supplier: '水戸市場',
      lastUpdated: '09:30'
    },
    {
      productId: 'prod_tomato',
      productName: 'トマト',
      category: '果菜類',
      unit: '箱',
      marketPrice: 850,
      purchasePrice: 800,
      salePrice: 1200,
      priceChange: -50,
      priceChangePercent: -5.56,
      supplier: '茨城県農協',
      lastUpdated: '09:45'
    },
    {
      productId: 'prod_onion',
      productName: '玉ねぎ',
      category: '根菜類',
      unit: 'kg',
      marketPrice: 160,
      purchasePrice: 150,
      salePrice: 300,
      priceChange: 10,
      priceChangePercent: 6.67,
      supplier: '北海道産直',
      lastUpdated: '10:00'
    },
    {
      productId: 'prod_lettuce',
      productName: 'レタス',
      category: '葉物野菜',
      unit: '個',
      marketPrice: 110,
      purchasePrice: 100,
      salePrice: 180,
      priceChange: 15,
      priceChangePercent: 15.79,
      supplier: '水戸市場',
      lastUpdated: '09:30'
    },
    {
      productId: 'prod_potato',
      productName: 'じゃがいも (メークイン)',
      category: '根菜類',
      unit: 'kg',
      marketPrice: 125,
      purchasePrice: 120,
      salePrice: 200,
      priceChange: 5,
      priceChangePercent: 4.17,
      supplier: '北海道産直',
      lastUpdated: '08:45'
    },
    {
      productId: 'prod_carrot',
      productName: '人参',
      category: '根菜類',
      unit: 'kg',
      marketPrice: 135,
      purchasePrice: 130,
      salePrice: 250,
      priceChange: -10,
      priceChangePercent: -6.90,
      supplier: '千葉県農協',
      lastUpdated: '09:15'
    }
  ];

  const filteredPriceData = useMemo(() => {
    if (selectedCategory === 'all') {
      return mockPriceData;
    }
    return mockPriceData.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getProfitMargin = (purchasePrice: number, salePrice: number) => {
    return ((salePrice - purchasePrice) / salePrice * 100);
  };

  const refreshPrices = () => {
    // 実際にはAPIを呼び出して最新価格を取得
    alert('価格情報を更新しました');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <CurrencyYenIcon className="w-8 h-8 mr-3 text-green-700" />
          <h1 className="text-3xl font-bold text-green-800">仕入価格情報</h1>
        </div>
        <p className="text-gray-600">市場価格データに基づく仕入価格情報を確認できます</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                対象日付
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリー
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">全カテゴリー</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={refreshPrices} variant="primary" size="md">
                価格情報を更新
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            選択日: {selectedDate} | 表示カテゴリー: {selectedCategory === 'all' ? '全カテゴリー' : selectedCategory} 
            ({filteredPriceData.length}品目)
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-4">
          <TableCellsIcon className="w-6 h-6 mr-2 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">価格一覧</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">商品名</th>
                <th className="border border-gray-300 px-4 py-2 text-left">カテゴリー</th>
                <th className="border border-gray-300 px-4 py-2 text-right">市場価格</th>
                <th className="border border-gray-300 px-4 py-2 text-right">仕入価格</th>
                <th className="border border-gray-300 px-4 py-2 text-right">販売価格</th>
                <th className="border border-gray-300 px-4 py-2 text-right">粗利率</th>
                <th className="border border-gray-300 px-4 py-2 text-right">前日比</th>
                <th className="border border-gray-300 px-4 py-2 text-left">仕入先</th>
                <th className="border border-gray-300 px-4 py-2 text-center">更新時刻</th>
              </tr>
            </thead>
            <tbody>
              {filteredPriceData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    該当するデータがありません
                  </td>
                </tr>
              ) : (
                filteredPriceData.map((item, index) => (
                  <tr key={item.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{item.productName}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ¥{item.marketPrice.toLocaleString()}/{item.unit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                      ¥{item.purchasePrice.toLocaleString()}/{item.unit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ¥{item.salePrice.toLocaleString()}/{item.unit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {getProfitMargin(item.purchasePrice, item.salePrice).toFixed(1)}%
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-semibold ${getPriceChangeColor(item.priceChange)}`}>
                      {item.priceChange > 0 ? '+' : ''}{item.priceChange}円
                      <br />
                      <span className="text-xs">
                        ({item.priceChangePercent > 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{item.supplier}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.lastUpdated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">価格情報サマリー</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <p>• 表示品目数: {filteredPriceData.length}品目</p>
              <p>• 平均粗利率: {filteredPriceData.length > 0 ? 
                (filteredPriceData.reduce((sum, item) => sum + getProfitMargin(item.purchasePrice, item.salePrice), 0) / filteredPriceData.length).toFixed(1) 
                : '0'}%</p>
            </div>
            <div>
              <p>• 値上がり品目: {filteredPriceData.filter(item => item.priceChange > 0).length}品目</p>
              <p>• 値下がり品目: {filteredPriceData.filter(item => item.priceChange < 0).length}品目</p>
            </div>
            <div>
              <p>• 最終更新: {selectedDate}</p>
              <p>• データソース: 市場価格API</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default PurchasePriceInfoPage;