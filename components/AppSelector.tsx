import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { CogIcon } from './icons/CogIcon';

interface AppSelectorProps {
  onSelectApp: (appType: 'customer' | 'admin') => void;
}

const AppSelector: React.FC<AppSelectorProps> = ({ onSelectApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">水</span>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-2">水戸青果株式会社</h1>
          <p className="text-xl text-gray-600">統合管理システム</p>
          <p className="text-sm text-gray-500 mt-2">
            ご利用になるシステムを選択してください
          </p>
        </div>

        {/* App Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Interface Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow duration-300 cursor-pointer group" 
                onClick={() => window.location.href = '/order.html'}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">顧客注文システム</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                お客様専用の注文フォームです。<br />
                顧客IDを入力して簡単に注文を作成できます。
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">主な機能</h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• 顧客ID入力による自動情報取得</li>
                  <li>• あいうえお順商品リスト</li>
                  <li>• 簡単な数量入力</li>
                  <li>• 注文確認・印刷機能</li>
                </ul>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/order.html';
                }}
                variant="primary" 
                className="w-full py-3 text-lg"
              >
                顧客注文システムを開く
              </Button>
            </div>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => onSelectApp('admin')}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <CogIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">管理者ダッシュボード</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                管理者専用の統合分析システムです。<br />
                売上・在庫・顧客データを一元管理できます。
              </p>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">主な機能</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• リアルタイム売上分析</li>
                  <li>• 在庫・仕入管理</li>
                  <li>• 顧客情報管理</li>
                  <li>• 統合分析・レポート</li>
                </ul>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectApp('admin');
                }}
                variant="primary" 
                className="w-full py-3 text-lg"
              >
                管理者ダッシュボードを開く
              </Button>
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <Card className="p-6 bg-white/70 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">本社所在地</h3>
                <p className="text-gray-600">
                  〒310-0015<br />
                  茨城県水戸市宮町1-1-1<br />
                  水戸ビルディング 3F
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">お問い合わせ</h3>
                <p className="text-gray-600">
                  TEL: 029-123-4567<br />
                  FAX: 029-123-4568<br />
                  Email: info@mitoseika.example.com
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">営業時間</h3>
                <p className="text-gray-600">
                  月〜土: 6:00 - 14:00<br />
                  日・祝: 休業<br />
                  注文締切: 当日6:00まで
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 水戸青果株式会社. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppSelector;