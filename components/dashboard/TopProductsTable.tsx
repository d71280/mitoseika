
import React from 'react';
import { TopSellingProductData, ProductUnit } from '../../types';
import Card from '../ui/Card';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon'; // Re-using for general "top" indication

const TopProductsTable: React.FC = () => {
  const topProducts: TopSellingProductData[] = [
    { id: 'prod1', name: 'キャベツ', quantity: 45, unit: ProductUnit.ITEM, grossProfitAmount: 15400, grossProfitMargin: 25 },
    { id: 'prod2', name: 'トマト', quantity: 32, unit: ProductUnit.BOX, grossProfitAmount: 12800, grossProfitMargin: 30 },
    { id: 'prod3', name: 'レタス', quantity: 28, unit: ProductUnit.ITEM, grossProfitAmount: 8900, grossProfitMargin: 22 },
    { id: 'prod4', name: 'ジャガイモ', quantity: 50, unit: ProductUnit.KILOGRAM, grossProfitAmount: 7200, grossProfitMargin: 20 },
    { id: 'prod5', name: 'キュウリ', quantity: 35, unit: ProductUnit.BOX, grossProfitAmount: 6800, grossProfitMargin: 28 },
  ];

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-green-700" />
        リアルタイム売上TOP5
      </h2>
      <div className="min-w-full">
        <table className="w-full table-auto">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">粗利額</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">粗利率</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{product.quantity}{product.unit}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">¥{product.grossProfitAmount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{product.grossProfitMargin}%</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                  <button className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors">
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TopProductsTable;
