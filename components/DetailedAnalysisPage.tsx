import React from 'react';
import Card from './ui/Card';
import { AnalysisCardData } from '../types';
import { PageView } from '../App'; // Import PageView
import { CubeIcon } from './icons/CubeIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { ClockIcon } from './icons/ClockIcon';
import Button from './ui/Button';

interface DetailedAnalysisPageProps {
  navigateTo: (page: PageView, itemId?: string) => void;
}

const mockProductAnalysis: AnalysisCardData[] = [
  {
    id: 'prod_cabbage', // Unique ID for cabbage
    title: 'キャベツ分析',
    icon: <CubeIcon className="w-6 h-6 text-green-600" />,
    metrics: [
      { label: '平均粗利率（過去30日）', value: '28%' },
      { label: '総販売数（過去30日）', value: '1,250個' },
      { label: '主要顧客', value: 'A商店 (60%)' },
    ],
    chartPlaceholder: 'キャベツの粗利推移グラフ (30日間)',
  },
  {
    id: 'prod_tomato', // Unique ID for tomato
    title: 'トマト分析',
    icon: <CubeIcon className="w-6 h-6 text-red-600" />,
    metrics: [
      { label: '平均粗利率（過去30日）', value: '32%' },
      { label: '総販売数（過去30日）', value: '800箱' },
      { label: '季節トレンド', value: '夏場に需要増' },
    ],
    chartPlaceholder: 'トマトの販売数推移グラフ (30日間)',
  },
];

const mockClientAnalysis: AnalysisCardData[] = [
  {
    id: 'client_AStore', // Unique ID for A商店
    title: 'A商店 分析',
    icon: <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />,
    metrics: [
      { label: '総取引額（過去90日）', value: '¥2,500,000' },
      { label: '主要注文商品', value: 'キャベツ, 大根' },
      { label: '注文頻度', value: '週3回' },
    ],
    chartPlaceholder: 'A商店の注文ボリューム推移 (90日間)',
  },
  {
    id: 'client_BDiner', // Unique ID for B食堂
    title: 'B食堂 分析',
    icon: <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />,
    metrics: [
      { label: '総取引額（過去90日）', value: '¥1,800,000' },
      { label: '主要注文商品', value: 'トマト, レタス, 玉ねぎ' },
      { label: '平均注文単価', value: '¥15,000' },
    ],
    chartPlaceholder: 'B食堂の平均注文単価推移 (90日間)',
  },
];

interface AnalysisItemCardProps {
  item: AnalysisCardData;
  onViewDetails: () => void;
}

const AnalysisItemCard: React.FC<AnalysisItemCardProps> = ({ item, onViewDetails }) => (
  <Card className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow">
    <div className="flex items-center mb-3">
      {item.icon}
      <h3 className="text-md font-semibold text-gray-800 ml-2">{item.title}</h3>
    </div>
    <div className="space-y-1 text-sm mb-3">
      {item.metrics.map(metric => (
        <div key={metric.label} className="flex justify-between">
          <span className="text-gray-600">{metric.label}:</span>
          <span className="font-medium text-gray-700">{metric.value}</span>
        </div>
      ))}
    </div>
    <div className="text-center text-xs text-gray-500 bg-slate-50 p-3 rounded h-24 flex items-center justify-center">
      {item.chartPlaceholder}
    </div>
    <Button onClick={onViewDetails} variant="ghost" size="sm" className="mt-3 w-full text-green-600 hover:bg-green-50">
      詳細レポートを見る
    </Button>
  </Card>
);

const DetailedAnalysisPage: React.FC<DetailedAnalysisPageProps> = ({ navigateTo }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">詳細分析</h1>
      </header>
      <div className="space-y-8">
        <section>
          <div className="flex items-center mb-4">
            <CubeIcon className="w-7 h-7 text-green-700" />
            <h2 className="text-xl font-semibold text-gray-700 ml-2">商品別分析</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProductAnalysis.map(item => (
              <AnalysisItemCard 
                key={item.id} 
                item={item} 
                onViewDetails={() => navigateTo(PageView.PRODUCT_ANALYSIS_DETAIL, item.id)} 
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">商品ごとの粗利推移、法人別売上構成、在庫回転率、季節変動パターンなど。</p>
        </section>
        
        <section>
          <div className="flex items-center mb-4">
            <BuildingStorefrontIcon className="w-7 h-7 text-blue-700" />
            <h2 className="text-xl font-semibold text-gray-700 ml-2">法人別分析</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockClientAnalysis.map(item => (
              <AnalysisItemCard 
                key={item.id} 
                item={item} 
                onViewDetails={() => navigateTo(PageView.CLIENT_ANALYSIS_DETAIL, item.id)} 
              />
            ))}
          </div>
           <p className="text-xs text-gray-500 mt-2">法人別の粗利ランキング、注文パターン、成長トレンド、支払いサイクルなど。</p>
        </section>

        <section>
          <div className="flex items-center mb-4">
            <ClockIcon className="w-7 h-7 text-purple-700" />
            <h2 className="text-xl font-semibold text-gray-700 ml-2">時系列分析</h2>
          </div>
          <Card className="bg-white p-4 shadow-md rounded-lg">
            <div className="text-center text-sm text-gray-500 bg-slate-50 p-6 rounded h-40 flex items-center justify-center mb-4">
              全体の売上・粗利トレンドグラフ (過去1年)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-100 p-2 rounded">
                <span className="text-gray-600">総売上 (直近30日): </span>
                <span className="font-semibold text-gray-800">¥12,345,678</span>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <span className="text-gray-600">総粗利 (直近30日): </span>
                <span className="font-semibold text-gray-800">¥2,469,135</span>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <span className="text-gray-600">前年同月比 (売上): </span>
                <span className="font-semibold text-green-600">+12.5%</span>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <span className="text-gray-600">前年同月比 (粗利): </span>
                <span className="font-semibold text-green-600">+15.2%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">売上・粗利のトレンド、前年同期比較、曜日・季節パターン、特異日の影響分析など。</p>
          </Card>
        </section>
      </div>
    </Card>
  );
};

export default DetailedAnalysisPage;