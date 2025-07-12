
import React from 'react';
import { SummaryMetric } from '../../types';
import Card from '../ui/Card';
import { ArrowTrendingUpIcon } from '../icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from '../icons/ArrowTrendingDownIcon';

interface SummaryCardProps {
  metric: SummaryMetric;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ metric }) => {
  const getChangeColor = () => {
    if (metric.changeType === 'positive') return 'text-green-600';
    if (metric.changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="bg-white p-5 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0 p-3 bg-slate-100 rounded-full">
          {metric.icon}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
        </div>
      </div>
      {metric.change && (
        <div className={`mt-2 text-sm flex items-center justify-end ${getChangeColor()}`}>
          {metric.changeType === 'positive' && <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />}
          {metric.changeType === 'negative' && <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
          <span>{metric.change} 前日比</span>
        </div>
      )}
    </Card>
  );
};

export default SummaryCard;
