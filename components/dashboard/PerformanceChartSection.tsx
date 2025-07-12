import React from 'react';
import Card from '../ui/Card';
import { ChartBarIcon } from '../icons/ChartBarIcon'; // Re-using for section title

const mockPerformanceData = [
  { name: '月', sales: 120, profit: 24 },
  { name: '火', sales: 150, profit: 35 },
  { name: '水', sales: 130, profit: 28 },
  { name: '木', sales: 160, profit: 40 },
  { name: '金', sales: 180, profit: 45 },
  { name: '土', sales: 90, profit: 15 },
];

const PerformanceChartSection: React.FC = () => {
  const maxValue = Math.max(...mockPerformanceData.map(d => d.sales), ...mockPerformanceData.map(d => d.profit), 0) * 1.1; // Add 10% padding

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2 text-purple-600" />
        売上・粗利推移 (週間)
      </h2>
      <div className="h-72 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${mockPerformanceData.length * 60 + 40} 200`}>
          {/* Y-axis labels and lines (simplified) */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => (
            <g key={tick}>
              <line 
                x1="35" y1={180 - (160 * tick)} 
                x2={mockPerformanceData.length * 60 + 35} y2={180 - (160 * tick)} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2"
              />
              <text x="30" y={185 - (160 * tick)} textAnchor="end" fontSize="10" fill="#6b7280">
                {Math.round(maxValue * tick / 10) * 10}万
              </text>
            </g>
          ))}
          
          {mockPerformanceData.map((item, index) => {
            const barWidth = 20;
            const groupX = 40 + index * 60;
            const salesHeight = (item.sales / maxValue) * 160;
            const profitHeight = (item.profit / maxValue) * 160;

            return (
              <g key={item.name}>
                {/* Sales Bar */}
                <rect
                  x={groupX}
                  y={180 - salesHeight}
                  width={barWidth}
                  height={salesHeight}
                  fill="#34d399" // green-400
                  rx="2"
                  ry="2"
                />
                {/* Profit Bar */}
                <rect
                  x={groupX + barWidth + 5}
                  y={180 - profitHeight}
                  width={barWidth}
                  height={profitHeight}
                  fill="#a78bfa" // purple-400
                  rx="2"
                  ry="2"
                />
                {/* X-axis Label */}
                <text x={groupX + barWidth / 2 + 2.5} y="195" textAnchor="middle" fontSize="12" fill="#374151">
                  {item.name}
                </text>
              </g>
            );
          })}
           {/* Legend */}
          <g transform="translate(40, 0)">
            <rect x="0" y="0" width="10" height="10" fill="#34d399" rx="2" />
            <text x="15" y="8" fontSize="10" fill="#374151">売上</text>
            <rect x="50" y="0" width="10" height="10" fill="#a78bfa" rx="2" />
            <text x="65" y="8" fontSize="10" fill="#374151">粗利</text>
          </g>
        </svg>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">※ 表示されているグラフはサンプルデータです。</p>
    </Card>
  );
};

export default PerformanceChartSection;