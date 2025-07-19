import React from 'react';
import SummarySection from './dashboard/SummarySection';
import PerformanceChartSection from './dashboard/PerformanceChartSection'; // New chart section
import RealtimeOrdersSection from './dashboard/RealtimeOrdersSection'; // New realtime orders section
import TodaysOrdersSection from './dashboard/TodaysOrdersSection'; // 本日の注文一覧
import Card from './ui/Card';
// PageView and Button imports are removed as navigation is handled by Sidebar

// navigateTo prop removed
const DashboardPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');

  return (
    <div className="space-y-6">
      <header className="mb-2 p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">
          経営ダッシュボード
        </h1>
        <p className="text-sm text-gray-600">{currentDate} 現在</p>
      </header>

      {/* Wrap main content sections in a generic div or use specific Card for each section if needed */}
      {/* The outer Card wrapper is removed to allow individual section Cards to have their own styling within the page flow */}
      <SummarySection />
      <PerformanceChartSection /> 
      <TodaysOrdersSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeOrdersSection />
      </div>

      {/* Footer with navigation buttons removed */}
    </div>
  );
};

export default DashboardPage;