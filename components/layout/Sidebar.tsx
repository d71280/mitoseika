
import React from 'react';
import { PageView } from '../../App';
import { HomeIcon } from '../icons/HomeIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { CogIcon } from '../icons/CogIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon'; 
import { PrinterIcon } from '../icons/PrinterIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon'; // New icon for Inventory
import { UserGroupIcon } from '../icons/UserGroupIcon'; // New icon for Client Management
import { PresentationChartLineIcon } from '../icons/PresentationChartLineIcon'; // Icon for Order Analysis
import { CurrencyYenIcon } from '../icons/CurrencyYenIcon'; // Icon for Purchase Price Info

interface SidebarProps {
  currentPage: PageView;
  navigateTo: (page: PageView) => void;
  onBackToSelector?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, onBackToSelector }) => {
  const navItems = [
    { page: PageView.DASHBOARD, label: 'ダッシュボード', icon: <HomeIcon className="w-6 h-6" /> },
    { page: PageView.INTEGRATED_ANALYSIS, label: '統合分析', icon: <PresentationChartLineIcon className="w-6 h-6" /> },
    { page: PageView.CLIENT_MANAGEMENT, label: '顧客管理', icon: <UserGroupIcon className="w-6 h-6" /> },
    { page: PageView.INVENTORY_MANAGEMENT, label: '在庫管理', icon: <ArchiveBoxIcon className="w-6 h-6" /> },
    { page: PageView.SUPPLIER_LIST, label: '仕入先管理', icon: <UsersIcon className="w-6 h-6" /> },
    { page: PageView.PURCHASE_PRICE_INFO, label: '仕入価格情報', icon: <CurrencyYenIcon className="w-6 h-6" /> },
    { page: PageView.DELIVERY_SLIP, label: '納品書発行', icon: <PrinterIcon className="w-6 h-6" /> },
    { page: PageView.SETTINGS, label: '設定', icon: <CogIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 bg-green-800 text-white flex flex-col shadow-lg print:hidden">
      <div className="p-5 border-b border-green-700 flex items-center space-x-3">
        <ChartBarIcon className="h-10 w-10 text-lime-400" />
        <div>
          <h1 className="text-xl font-bold">水戸青果</h1>
          <p className="text-xs text-green-300">粗利管理システム</p>
        </div>
      </div>
      <nav className="flex-grow p-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out
                        ${currentPage === item.page
                          ? 'bg-lime-500 text-green-900 font-semibold shadow-md'
                          : 'hover:bg-green-700 text-green-100 hover:text-white'
                        }`}
            aria-current={currentPage === item.page ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-green-700">
        {onBackToSelector && (
          <button
            onClick={onBackToSelector}
            className="w-full mb-3 px-3 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm transition-colors"
          >
            ← メニューに戻る
          </button>
        )}
        <p className="text-xs text-green-300 text-center">&copy; 2024 水戸青果株式会社</p>
      </div>
    </aside>
  );
};

export default Sidebar;
