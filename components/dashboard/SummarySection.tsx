
import React, { useState, useEffect } from 'react';
import { SummaryMetric } from '../../types';
import SummaryCard from './SummaryCard';
import { CurrencyYenIcon } from '../icons/CurrencyYenIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';

interface DashboardStats {
  sales: { value: number; change: string; changeType: string };
  profit: { value: number; change: string; changeType: string };
  orders: { value: number; change: string; changeType: string };
}

const SummarySection: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3001`
    : window.location.origin;

  // ダッシュボード統計データを取得
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Dashboard stats取得エラー:', data.error);
      }
    } catch (error) {
      console.error('Dashboard stats API error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // フォーマット関数
  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${Math.round(value / 10000)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  // ローディング中やデータがない場合のデフォルト値
  const summaryMetrics: SummaryMetric[] = [
    {
      id: 'sales',
      title: '売上予想',
      value: loading ? '読み込み中...' : (stats ? formatCurrency(stats.sales.value) : '¥0'),
      change: loading ? '...' : (stats?.sales.change || '0%'),
      changeType: (stats?.sales.changeType as 'positive' | 'negative') || 'positive',
      icon: <CurrencyYenIcon className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 'profit',
      title: '粗利予想',
      value: loading ? '読み込み中...' : (stats ? formatCurrency(stats.profit.value) : '¥0'),
      change: loading ? '...' : (stats?.profit.change || '0%'),
      changeType: (stats?.profit.changeType as 'positive' | 'negative') || 'positive',
      icon: <ChartBarIcon className="w-8 h-8 text-green-500" />,
    },
    {
      id: 'orders',
      title: '注文件数',
      value: loading ? '読み込み中...' : (stats ? `${stats.orders.value}件` : '0件'),
      change: loading ? '...' : (stats?.orders.change || '0件'),
      changeType: (stats?.orders.changeType as 'positive' | 'negative') || 'positive',
      icon: <ClipboardListIcon className="w-8 h-8 text-indigo-500" />,
    },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2 text-green-700" />
        本日概況<span className="text-sm text-gray-500 ml-2">（朝6:00確定）</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <SummaryCard key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
};

export default SummarySection;
