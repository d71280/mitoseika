
import React from 'react';
import { SummaryMetric } from '../../types';
import SummaryCard from './SummaryCard';
import { CurrencyYenIcon } from '../icons/CurrencyYenIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';

const SummarySection: React.FC = () => {
  const summaryMetrics: SummaryMetric[] = [
    {
      id: 'sales',
      title: '売上予想',
      value: '¥120万',
      change: '+8%',
      changeType: 'positive',
      icon: <CurrencyYenIcon className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 'profit',
      title: '粗利予想',
      value: '¥24万',
      change: '+12%',
      changeType: 'positive',
      icon: <ChartBarIcon className="w-8 h-8 text-green-500" />,
    },
    {
      id: 'orders',
      title: '注文件数',
      value: '142件',
      change: '+15件',
      changeType: 'positive',
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
