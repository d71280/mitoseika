import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import PageHeader from './ui/PageHeader';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';

interface OrderAnalysisPageProps {
  orders: Order[];
}

type AnalysisType = 'product' | 'client';

interface ProductAnalysis {
  productName: string;
  orderCount: number;
  totalQuantity: number;
  totalAmount: number;
}

interface ClientAnalysis {
  clientName: string;
  orderCount: number;
  totalAmount: number;
  lastOrderDate: string;
}

const OrderAnalysisPage: React.FC<OrderAnalysisPageProps> = ({ orders }) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('product');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (startDate) {
      filtered = filtered.filter(order => order.issueDate >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(order => order.issueDate <= endDate);
    }
    
    return filtered;
  }, [orders, startDate, endDate]);

  const productAnalysis = useMemo((): ProductAnalysis[] => {
    const productMap = new Map<string, ProductAnalysis>();
    
    filteredOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const existing = productMap.get(item.productName);
          if (existing) {
            existing.orderCount += 1;
            existing.totalQuantity += item.quantity;
            existing.totalAmount += item.totalPrice;
          } else {
            productMap.set(item.productName, {
              productName: item.productName,
              orderCount: 1,
              totalQuantity: item.quantity,
              totalAmount: item.totalPrice
            });
          }
        });
      }
    });
    
    return Array.from(productMap.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, [filteredOrders]);

  const clientAnalysis = useMemo((): ClientAnalysis[] => {
    const clientMap = new Map<string, ClientAnalysis>();
    
    filteredOrders.forEach(order => {
      const existing = clientMap.get(order.clientName);
      if (existing) {
        existing.orderCount += 1;
        existing.totalAmount += order.totalAmount;
        if (order.issueDate > existing.lastOrderDate) {
          existing.lastOrderDate = order.issueDate;
        }
      } else {
        clientMap.set(order.clientName, {
          clientName: order.clientName,
          orderCount: 1,
          totalAmount: order.totalAmount,
          lastOrderDate: order.issueDate
        });
      }
    });
    
    return Array.from(clientMap.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, [filteredOrders]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getOneMonthAgoDate = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return oneMonthAgo.toISOString().split('T')[0];
  };

  const setLastMonth = () => {
    setStartDate(getOneMonthAgoDate());
    setEndDate(getTodayDate());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="注文分析"
        subtitle="商品別・顧客別の注文データを分析します"
        icon={<ChartBarIcon className="w-8 h-8" />}
      />

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分析タイプ
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="product">商品別分析</option>
                <option value="client">顧客別分析</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={setLastMonth} variant="secondary" size="sm">
              過去1ヶ月
            </Button>
            <Button onClick={resetFilters} variant="ghost" size="sm">
              フィルターをリセット
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-4">
          <TableCellsIcon className="w-6 h-6 mr-2 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {analysisType === 'product' ? '商品別注文分析' : '顧客別注文分析'}
          </h2>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          対象期間: {startDate || '全期間開始'} ～ {endDate || '全期間終了'} 
          ({filteredOrders.length}件の注文)
        </div>

        {analysisType === 'product' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">商品名</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">注文回数</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">総注文数量</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">総売上金額</th>
                </tr>
              </thead>
              <tbody>
                {productAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  productAnalysis.map((item, index) => (
                    <tr key={item.productName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{item.productName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.orderCount}回</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.totalQuantity.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">¥{item.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">顧客名</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">注文回数</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">総注文金額</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">最終注文日</th>
                </tr>
              </thead>
              <tbody>
                {clientAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  clientAnalysis.map((item, index) => (
                    <tr key={item.clientName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{item.clientName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.orderCount}回</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">¥{item.totalAmount.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {new Date(item.lastOrderDate).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {(analysisType === 'product' ? productAnalysis.length : clientAnalysis.length) > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">分析サマリー</h3>
            {analysisType === 'product' ? (
              <div className="text-sm text-green-700">
                <p>• 商品種類数: {productAnalysis.length}種類</p>
                <p>• 最多注文商品: {productAnalysis[0]?.productName} ({productAnalysis[0]?.orderCount}回)</p>
                <p>• 総売上金額: ¥{productAnalysis.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}</p>
              </div>
            ) : (
              <div className="text-sm text-green-700">
                <p>• 顧客数: {clientAnalysis.length}社</p>
                <p>• 最多注文顧客: {clientAnalysis[0]?.clientName} ({clientAnalysis[0]?.orderCount}回)</p>
                <p>• 総注文金額: ¥{clientAnalysis.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderAnalysisPage;