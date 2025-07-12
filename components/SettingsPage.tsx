import React, { useState } from 'react';
import Card from './ui/Card';
// PageHeader import removed
import Button from './ui/Button';
import { SettingsData, initialSettingsData, DashboardDisplaySettings } from '../types';
import { PageView } from '../App';
import { ClockIcon } from './icons/ClockIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CubeIcon } from './icons/CubeIcon';
import { BellAlertIcon } from './icons/BellAlertIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface SettingsPageProps {
  // onNavigateBack prop removed
  navigateTo: (page: PageView) => void; // Still needed for internal navigation like "仕入先情報管理"
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigateTo }) => {
  const [settings, setSettings] = useState<SettingsData>(initialSettingsData);

  const handleInputChange = (key: keyof SettingsData, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: keyof DashboardDisplaySettings) => {
    setSettings(prev => ({
      ...prev,
      dashboardDisplay: {
        ...prev.dashboardDisplay,
        [key]: !prev.dashboardDisplay[key],
      }
    }));
  };

  const handleSave = (settingName: string) => {
    console.log(`Saving ${settingName}:`, settings);
    alert(`${settingName}の設定を保存しました（コンソールログ確認）。`);
  };
  
  const clientOptions = [
    { value: "clientA", label: "A商店" },
    { value: "clientB", label: "B食堂" },
    { value: "clientC", label: "C青果" },
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">システム設定</h1>
      </header>
      <div className="space-y-8">

        {/* 注文締切時間設定 */}
        <SettingCategory title="注文締切時間設定" icon={<ClockIcon className="w-6 h-6 text-orange-500" />}>
          <div className="flex items-center space-x-3">
            <label htmlFor="orderDeadlineTime" className="text-sm font-medium text-gray-700">締切時間:</label>
            <input
              type="time"
              id="orderDeadlineTime"
              value={settings.orderDeadlineTime}
              onChange={(e) => handleInputChange('orderDeadlineTime', e.target.value)}
              className="mt-1 block w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
            <Button size="sm" onClick={() => handleSave('注文締切時間')}>保存</Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">毎日の注文受付を自動で締め切る時間を設定します。</p>
        </SettingCategory>

        {/* 法人別ルール管理 */}
        <SettingCategory title="法人別ルール管理" icon={<UsersIcon className="w-6 h-6 text-blue-500" />}>
          <div className="flex items-center space-x-3">
            <label htmlFor="clientRuleSelect" className="text-sm font-medium text-gray-700">対象法人:</label>
            <select
              id="clientRuleSelect"
              value={settings.selectedClientRule}
              onChange={(e) => handleInputChange('selectedClientRule', e.target.value)}
              className="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              {clientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <Button size="sm" variant="secondary">ルールを編集</Button>
          </div>
           <Button size="sm" variant="ghost" className="mt-2 text-green-600 hover:text-green-800">
            <PlusCircleIcon className="w-4 h-4 mr-1" />
            新規法人ルールを追加
          </Button>
          <p className="text-xs text-gray-500 mt-1">法人ごとの商品表記揺れや単位変換ルールを設定します。</p>
        </SettingCategory>

        {/* 商品マスタ管理 */}
        <SettingCategory title="商品マスタ管理" icon={<CubeIcon className="w-6 h-6 text-teal-500" />}>
          <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-3">
            <Button size="sm" variant="secondary" className="w-full sm:w-auto">商品一覧・編集</Button>
            <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                <PlusCircleIcon className="w-4 h-4 mr-1" />新規商品を追加
            </Button>
            <Button size="sm" variant="secondary" className="w-full sm:w-auto">一括価格更新</Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">取扱商品の追加、編集、価格設定などを行います。</p>
        </SettingCategory>

        {/* アラート条件設定 */}
        <SettingCategory title="アラート条件設定" icon={<BellAlertIcon className="w-6 h-6 text-red-500" />}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label htmlFor="lowStockThreshold" className="text-sm font-medium text-gray-700 whitespace-nowrap">在庫不足 (しきい値):</label>
              <input
                type="number"
                id="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value,10))}
                className="mt-1 block w-20 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <span className="text-sm text-gray-600">個以下</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="abnormalOrderPercentage" className="text-sm font-medium text-gray-700 whitespace-nowrap">異常注文 (変動率):</label>
              <input
                type="number"
                id="abnormalOrderPercentage"
                value={settings.abnormalOrderPercentage}
                onChange={(e) => handleInputChange('abnormalOrderPercentage', parseInt(e.target.value,10))}
                className="mt-1 block w-20 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <span className="text-sm text-gray-600"> % 以上 (前日比)</span>
            </div>
          </div>
          <Button size="sm" onClick={() => handleSave('アラート条件')} className="mt-3">条件を保存</Button>
          <p className="text-xs text-gray-500 mt-1">在庫不足や異常注文量のアラート発生条件を設定します。</p>
        </SettingCategory>

        {/* ダッシュボード表示項目 */}
        <SettingCategory title="ダッシュボード表示項目設定" icon={<PresentationChartLineIcon className="w-6 h-6 text-indigo-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {(Object.keys(settings.dashboardDisplay) as Array<keyof DashboardDisplaySettings>).map(key => (
              <label key={key} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.dashboardDisplay[key]}
                  onChange={() => handleCheckboxChange(key)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span>{ {showSalesSummary: '売上予想', showProfitSummary: '粗利予想', showOrderCount: '注文件数', showWarningProducts: '警告商品', showTop5Products: '売上TOP5'}[key] }</span>
              </label>
            ))}
          </div>
          <Button size="sm" onClick={() => handleSave('ダッシュボード表示項目')} className="mt-3">表示設定を保存</Button>
          <p className="text-xs text-gray-500 mt-1">経営ダッシュボードに表示するサマリー項目を選択します。</p>
        </SettingCategory>
        
        {/* 仕入先情報管理 */}
        <SettingCategory title="仕入先情報管理" icon={<AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-500" />}>
           <Button size="sm" variant="secondary" onClick={() => navigateTo(PageView.SUPPLIER_LIST)}>
            仕入先一覧へ移動
          </Button>
          <p className="text-xs text-gray-500 mt-1">仕入先の連絡先や取引条件などを管理します。（仕入先一覧ページで操作）</p>
        </SettingCategory>

      </div>
    </Card>
  );
};

interface SettingCategoryProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const SettingCategory: React.FC<SettingCategoryProps> = ({ title, icon, children }) => (
  <section className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-gray-700 ml-2">{title}</h3>
    </div>
    <div className="pl-8"> {/* Indent content under category title */}
        {children}
    </div>
  </section>
);


export default SettingsPage;