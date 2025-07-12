
import React, { useState } from 'react';
import { Order, CompanyInfo } from '../types';
import DeliverySlipPreview from './delivery/DeliverySlipPreview';
import Card from './ui/Card';
import Button from './ui/Button';
import { PrinterIcon } from './icons/PrinterIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

interface DeliverySlipPageProps {
  orders: Order[];
  companyInfo: CompanyInfo;
}

type ViewMode = 'list' | 'single' | 'batchToday';

const DeliverySlipPage: React.FC<DeliverySlipPageProps> = ({ orders, companyInfo }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [ordersForBatchPrint, setOrdersForBatchPrint] = useState<Order[]>([]);

  const getTodayDateString = (): string => {
    const today = new Date();
    // Adjust for timezone to ensure correct date in Japan (YYYY-MM-DD)
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('single');
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setOrdersForBatchPrint([]);
    setViewMode('list');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBatchPrintToday = () => {
    const todayStr = getTodayDateString();
    const todayOrders = orders.filter(order => order.issueDate === todayStr);

    if (todayOrders.length === 0) {
      alert("本日発行対象の納品書はありません。");
      return;
    }
    setOrdersForBatchPrint(todayOrders);
    setSelectedOrder(null); 
    setViewMode('batchToday');
  };

  if (viewMode === 'single' && selectedOrder) {
    return (
      <div className="print:p-0">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Button onClick={handleBackToList} variant="ghost" size="sm" className="text-green-700 hover:text-green-800">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            注文一覧へ戻る
          </Button>
          <h1 className="text-2xl font-bold text-green-800">納品書プレビュー</h1>
          <Button onClick={handlePrint} variant="primary" size="md">
            <PrinterIcon className="w-5 h-5 mr-2" />
            印刷する
          </Button>
        </div>
        <DeliverySlipPreview order={selectedOrder} companyInfo={companyInfo} />
      </div>
    );
  }

  if (viewMode === 'batchToday') {
    return (
      <div className="print:p-0">
        <div className="mb-6 flex justify-between items-center print:hidden">
           <Button onClick={handleBackToList} variant="ghost" size="sm" className="text-green-700 hover:text-green-800">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            注文一覧へ戻る
          </Button>
          <h1 className="text-2xl font-bold text-green-800">本日分納品書 一括プレビュー</h1>
          <Button onClick={handlePrint} variant="primary" size="md">
            <PrinterIcon className="w-5 h-5 mr-2" />
            すべて印刷
          </Button>
        </div>
        <div className="space-y-4 print:space-y-0">
          {ordersForBatchPrint.map(order => (
            <div key={order.id} className="batch-print-slip"> {/* Apply page-break-after here via CSS */}
              <DeliverySlipPreview order={order} companyInfo={companyInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // viewMode === 'list'
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 flex items-center">
            <PrinterIcon className="w-8 h-8 mr-3 text-green-700" />
            納品書発行 - 注文選択
          </h1>
          <p className="text-sm text-gray-600 mt-1">納品書を作成する注文を選択するか、本日分を一括で印刷します。</p>
        </div>
        <Button 
          onClick={handleBatchPrintToday} 
          variant="primary" 
          size="md"
          className="mt-3 sm:mt-0"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          本日分を一括印刷
        </Button>
      </header>
      {orders.length === 0 ? (
        <p className="text-gray-600">発行対象の注文がありません。</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-green-700">{order.clientName}様</h2>
                  <p className="text-sm text-gray-500">注文番号: {order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    発行日: {new Date(order.issueDate).toLocaleDateString('ja-JP')}
                  </p>
                  <p className="text-sm text-gray-500">合計金額: ¥{order.totalAmount.toLocaleString()}</p>
                </div>
                <Button 
                  onClick={() => handleSelectOrder(order)} 
                  variant="secondary" 
                  size="sm"
                  className="mt-3 sm:mt-0"
                >
                  <ClipboardListIcon className="w-4 h-4 mr-2" />
                  納品書を作成・表示
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DeliverySlipPage;