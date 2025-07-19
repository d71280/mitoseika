import React, { useState, useMemo, useEffect } from 'react';
import { Order } from '../types';
import { supabase, fetchOrdersWithDetails, Order as DbOrder } from '../lib/supabase';
import Card from './ui/Card';
import Button from './ui/Button';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { CurrencyYenIcon } from './icons/CurrencyYenIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface IntegratedAnalysisPageProps {}

type AnalysisTab = 'overview' | 'purchase-analysis' | 'client-timeline' | 'product-timeline';

interface TimeSeriesData {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  cost: number;
}

interface ClientTimelineData {
  clientName: string;
  timeline: TimeSeriesData[];
  totalOrders: number;
  totalRevenue: number;
  averageProfit: number;
}

interface ProductTimelineData {
  productName: string;
  timeline: TimeSeriesData[];
  totalQuantity: number;
  totalRevenue: number;
  averageProfit: number;
  averageCost: number;
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getOneMonthAgoDate = () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return oneMonthAgo.toISOString().split('T')[0];
};

const IntegratedAnalysisPage: React.FC<IntegratedAnalysisPageProps> = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');
  const [startDate, setStartDate] = useState<string>(getOneMonthAgoDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
    
    // リアルタイム購読
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await fetchOrdersWithDetails(1000);
      setOrders(allOrders);
    } catch (error) {
      console.error('注文データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (startDate) {
      filtered = filtered.filter(order => order.order_date >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(order => order.order_date <= endDate);
    }
    
    return filtered;
  }, [orders, startDate, endDate]);

  // 注文状況サマリー
  const orderSummary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const estimatedProfit = filteredOrders.reduce((sum, order) => {
      const profit = order.items.reduce((itemSum, item) => {
        const estimatedCost = item.unit_price * 0.6; // 仮の原価率60%
        return itemSum + ((item.unit_price - estimatedCost) * item.quantity);
      }, 0);
      return sum + profit;
    }, 0);
    const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      estimatedProfit,
      profitMargin,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }, [filteredOrders]);

  // クライアント別時系列データ
  const clientTimelineData = useMemo((): ClientTimelineData[] => {
    const clientMap = new Map<string, Map<string, TimeSeriesData>>();
    
    filteredOrders.forEach(order => {
      if (!clientMap.has(order.clientName)) {
        clientMap.set(order.clientName, new Map());
      }
      
      const clientData = clientMap.get(order.clientName)!;
      const dateKey = order.issueDate;
      
      if (!clientData.has(dateKey)) {
        clientData.set(dateKey, {
          date: dateKey,
          orders: 0,
          revenue: 0,
          profit: 0,
          cost: 0
        });
      }
      
      const dayData = clientData.get(dateKey)!;
      const estimatedProfit = order.items.reduce((sum, item) => {
        const estimatedCost = item.unitPrice * 0.6;
        return sum + ((item.unitPrice - estimatedCost) * item.quantity);
      }, 0);
      const estimatedCost = order.totalAmount - estimatedProfit;
      
      dayData.orders += 1;
      dayData.revenue += order.totalAmount;
      dayData.profit += estimatedProfit;
      dayData.cost += estimatedCost;
    });

    return Array.from(clientMap.entries()).map(([clientName, timelineMap]) => {
      const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      const totalOrders = timeline.reduce((sum, day) => sum + day.orders, 0);
      const totalRevenue = timeline.reduce((sum, day) => sum + day.revenue, 0);
      const totalProfit = timeline.reduce((sum, day) => sum + day.profit, 0);
      
      return {
        clientName,
        timeline,
        totalOrders,
        totalRevenue,
        averageProfit: totalOrders > 0 ? totalProfit / totalOrders : 0
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredOrders]);

  // 商品別時系列データ
  const productTimelineData = useMemo((): ProductTimelineData[] => {
    const productMap = new Map<string, Map<string, TimeSeriesData & { quantity: number }>>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, new Map());
        }
        
        const productData = productMap.get(item.productName)!;
        const dateKey = order.issueDate;
        
        if (!productData.has(dateKey)) {
          productData.set(dateKey, {
            date: dateKey,
            orders: 0,
            revenue: 0,
            profit: 0,
            cost: 0,
            quantity: 0
          });
        }
        
        const dayData = productData.get(dateKey)!;
        const estimatedCost = item.unitPrice * 0.6;
        const profit = (item.unitPrice - estimatedCost) * item.quantity;
        
        dayData.orders += 1;
        dayData.revenue += item.totalPrice;
        dayData.profit += profit;
        dayData.cost += estimatedCost * item.quantity;
        dayData.quantity += item.quantity;
      });
    });

    return Array.from(productMap.entries()).map(([productName, timelineMap]) => {
      const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      const totalQuantity = timeline.reduce((sum, day) => sum + day.quantity, 0);
      const totalRevenue = timeline.reduce((sum, day) => sum + day.revenue, 0);
      const totalProfit = timeline.reduce((sum, day) => sum + day.profit, 0);
      const totalCost = timeline.reduce((sum, day) => sum + day.cost, 0);
      
      return {
        productName,
        timeline: timeline.map(({ quantity, ...rest }) => rest),
        totalQuantity,
        totalRevenue,
        averageProfit: totalQuantity > 0 ? totalProfit / totalQuantity : 0,
        averageCost: totalQuantity > 0 ? totalCost / totalQuantity : 0
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredOrders]);

  const resetFilters = () => {
    setStartDate(getOneMonthAgoDate());
    setEndDate(getTodayDate());
    setSelectedClient('all');
    setSelectedProduct('all');
  };

  const setLastMonth = () => {
    setStartDate(getOneMonthAgoDate());
    setEndDate(getTodayDate());
  };

  const setToday = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  };

  const tabs = [
    { id: 'overview', label: '注文状況', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'purchase-analysis', label: '仕入れ分析', icon: <ShoppingCartIcon className="w-5 h-5" /> },
  ];

  const uniqueClients = Array.from(new Set(filteredOrders.map(order => order.clientName)));
  const uniqueProducts = Array.from(new Set(filteredOrders.flatMap(order => order.items.map(item => item.productName))));


  // 仕入れ分析データ（在庫数を考慮した必要仕入数）
  const purchaseAnalysisData = useMemo(() => {
    const productMap = new Map<string, {
      productName: string;
      totalDemand: number;
      currentStock: number;
      requiredPurchase: number;
      unit: string;
      averageOrderQuantity: number;
      orderFrequency: number;
    }>();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, {
            productName: item.productName,
            totalDemand: 0,
            currentStock: Math.floor(Math.random() * 100) + 20, // 仮の在庫数（20-120）
            requiredPurchase: 0,
            unit: item.unit.toString(),
            averageOrderQuantity: 0,
            orderFrequency: 0
          });
        }

        const productData = productMap.get(item.productName)!;
        productData.totalDemand += item.quantity;
        productData.orderFrequency += 1;
      });
    });

    // 必要仕入数を計算
    return Array.from(productMap.values()).map(product => {
      const averageOrderQuantity = product.totalDemand / product.orderFrequency;
      const safetyStock = Math.ceil(averageOrderQuantity * 1.5); // 安全在庫は平均注文数の1.5倍
      const requiredPurchase = Math.max(0, product.totalDemand + safetyStock - product.currentStock);
      
      return {
        ...product,
        averageOrderQuantity,
        requiredPurchase
      };
    }).sort((a, b) => b.requiredPurchase - a.requiredPurchase);
  }, [filteredOrders]);

  // 日付範囲が複数日かどうかを判定
  const isMultipleDays = useMemo(() => {
    return startDate !== endDate;
  }, [startDate, endDate]);

  // 日次データ集計（グラフ用）
  const dailyData = useMemo(() => {
    const dateMap = new Map<string, { date: string; orders: number; revenue: number; profit: number; }>();
    
    filteredOrders.forEach(order => {
      const dateKey = order.issueDate;
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          orders: 0,
          revenue: 0,
          profit: 0
        });
      }
      
      const dayData = dateMap.get(dateKey)!;
      const estimatedProfit = order.items.reduce((sum, item) => {
        const estimatedCost = item.unitPrice * 0.6;
        return sum + ((item.unitPrice - estimatedCost) * item.quantity);
      }, 0);
      
      dayData.orders += 1;
      dayData.revenue += order.totalAmount;
      dayData.profit += estimatedProfit;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  // 簡易グラフコンポーネント
  const SimpleLineChart: React.FC<{ data: any[]; dataKey: string; title: string; color: string; }> = ({ data, dataKey, title, color }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = Math.min(...data.map(d => d[dataKey]));
    const range = maxValue - minValue || 1;
    
    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">{title}</h4>
        <div className="relative h-32 mb-2">
          <svg width="100%" height="100%" className="absolute inset-0">
            <polyline
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - (((d[dataKey] - minValue) / range) * 80 + 10);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (((d[dataKey] - minValue) / range) * 80 + 10);
              return (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill={color}
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
        <div className="text-center text-xs text-gray-600 mt-1">
          最大: {maxValue.toLocaleString()} | 最小: {minValue.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ChartBarIcon className="w-8 h-8 mr-3 text-green-700" />
          <h1 className="text-3xl font-bold text-green-800">統合分析</h1>
        </div>
        <p className="text-gray-600">注文状況、クライアント・商品別時系列データを総合的に分析します</p>
      </div>

      {/* フィルター */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={setToday} variant="primary" size="sm">本日</Button>
            <Button onClick={setLastMonth} variant="secondary" size="sm">過去1ヶ月</Button>
            <Button onClick={resetFilters} variant="ghost" size="sm">フィルターをリセット</Button>
          </div>

          <div className="text-sm text-gray-600">
            期間: {startDate} ～ {endDate} ({filteredOrders.length}件の注文)
          </div>
        </div>
      </Card>

      {/* タブナビゲーション */}
      <Card className="p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalysisTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">注文状況サマリー</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{orderSummary.totalOrders}</div>
                <div className="text-sm text-blue-800">総注文数</div>
              </Card>
              <Card className="p-4 bg-green-50">
                <div className="text-2xl font-bold text-green-600">¥{orderSummary.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-green-800">総売上</div>
              </Card>
              <Card className="p-4 bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">¥{Math.round(orderSummary.estimatedProfit).toLocaleString()}</div>
                <div className="text-sm text-yellow-800">推定粗利</div>
              </Card>
              <Card className="p-4 bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">{orderSummary.profitMargin.toFixed(1)}%</div>
                <div className="text-sm text-purple-800">粗利率</div>
              </Card>
            </div>
            <div className="mt-4">
              <Card className="p-4 bg-gray-50">
                <div className="text-lg font-bold text-gray-600">¥{Math.round(orderSummary.averageOrderValue).toLocaleString()}</div>
                <div className="text-sm text-gray-800">平均注文金額</div>
              </Card>
            </div>

            {/* 商品別データテーブル */}
            {productTimelineData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">商品別データ一覧</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">商品名</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">総数量</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">総売上</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">粗利</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productTimelineData.slice(0, 10).map((product, index) => (
                        <tr key={product.productName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">
                            <button 
                              onClick={() => setActiveTab('product-timeline')}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {product.productName}
                            </button>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{product.totalQuantity.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">¥{product.totalRevenue.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">¥{Math.round(product.averageProfit * product.totalQuantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* クライアント分析セクション */}
            {clientTimelineData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">クライアント分析</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">クライアント名</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">総注文数</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">総売上</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">粗利</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientTimelineData.slice(0, 10).map((client, index) => (
                        <tr key={client.clientName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{client.clientName}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{client.totalOrders}回</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">¥{client.totalRevenue.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">¥{Math.round(client.averageProfit * client.totalOrders).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}

        {activeTab === 'purchase-analysis' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">仕入れ分析</h2>
            <p className="text-gray-600 mb-4">在庫数を考慮した必要仕入数を表示します。安全在庫を含めた推奨仕入数量をご確認ください。</p>
            

            {/* 必要仕入数一覧テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">商品名</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">注文数</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">現在在庫</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">要仕入数</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseAnalysisData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        該当する仕入れデータがありません
                      </td>
                    </tr>
                  ) : (
                    purchaseAnalysisData.map((item, index) => (
                      <tr key={item.productName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{item.productName}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.orderFrequency}回
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.currentStock.toLocaleString()}{item.unit}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          <span className={item.requiredPurchase > 0 ? 'font-bold text-red-600' : 'text-green-600'}>
                            {item.requiredPurchase > 0 ? item.requiredPurchase.toLocaleString() : '0'}{item.unit}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 仕入れ推奨アクション */}
            {purchaseAnalysisData.filter(p => p.requiredPurchase > 0).length > 0 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">仕入れ推奨アクション</h3>
                <div className="space-y-2">
                  {purchaseAnalysisData
                    .filter(p => p.requiredPurchase > 0)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.productName} className="text-sm text-yellow-700">
                        • <strong>{item.productName}</strong>: {item.requiredPurchase.toLocaleString()}{item.unit} の仕入れを推奨
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}


      </Card>
    </div>
  );
};

export default IntegratedAnalysisPage;