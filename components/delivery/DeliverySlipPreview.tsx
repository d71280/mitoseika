
import React from 'react';
import { Order, CompanyInfo, ProductUnit } from '../../types';

interface DeliverySlipPreviewProps {
  order: Order;
  companyInfo: CompanyInfo;
}

const DeliverySlipPreview: React.FC<DeliverySlipPreviewProps> = ({ order, companyInfo }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未定';
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white p-8 md:p-12 shadow-2xl print:shadow-none print:p-6 mx-auto max-w-4xl border print:border-none rounded-lg print:rounded-none">
      {/* Header */}
      <header className="mb-8 pb-4 border-b-2 border-gray-300 print:border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 print:text-black">納品書</h1>
            {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt={companyInfo.name} className="h-12 mt-2 print:hidden" />}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-lg">{companyInfo.name}</p>
            <p>{companyInfo.postalCode}</p>
            <p>{companyInfo.addressLine1}</p>
            {companyInfo.addressLine2 && <p>{companyInfo.addressLine2}</p>}
            <p>TEL: {companyInfo.phone} {companyInfo.fax && `FAX: ${companyInfo.fax}`}</p>
            {companyInfo.email && <p>Email: {companyInfo.email}</p>}
            {companyInfo.registrationNumber && <p className="mt-1">登録番号: {companyInfo.registrationNumber}</p>}
          </div>
        </div>
      </header>

      {/* Client and Order Info */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 print:text-black mb-1">{order.clientName} 御中</h2>
          <p className="text-sm">{order.clientAddress || '住所未登録'}</p>
          {/* Add client contact info if available in order object */}
        </div>
        <div className="text-sm md:text-right">
          <p><span className="font-semibold">納品書番号:</span> {order.orderNumber}</p>
          <p><span className="font-semibold">発行日:</span> {formatDate(order.issueDate)}</p>
          <p><span className="font-semibold">納品日:</span> {formatDate(order.deliveryDate)}</p>
          {order.paymentDueDate && <p><span className="font-semibold">支払期日:</span> {formatDate(order.paymentDueDate)}</p>}
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-8">
        <table className="w-full border-collapse border border-gray-300 print:border-black">
          <thead className="bg-gray-100 print:bg-gray-200">
            <tr>
              <th className="p-2 border border-gray-300 print:border-black text-left text-sm font-semibold">No.</th>
              <th className="p-2 border border-gray-300 print:border-black text-left text-sm font-semibold">品名</th>
              <th className="p-2 border border-gray-300 print:border-black text-right text-sm font-semibold">数量</th>
              <th className="p-2 border border-gray-300 print:border-black text-center text-sm font-semibold">単位</th>
              <th className="p-2 border border-gray-300 print:border-black text-right text-sm font-semibold">単価 (¥)</th>
              <th className="p-2 border border-gray-300 print:border-black text-right text-sm font-semibold">金額 (¥)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.itemNumber} className="hover:bg-gray-50 print:hover:bg-transparent">
                <td className="p-2 border border-gray-300 print:border-black text-sm text-center">{item.itemNumber}</td>
                <td className="p-2 border border-gray-300 print:border-black text-sm">{item.productName}</td>
                <td className="p-2 border border-gray-300 print:border-black text-sm text-right">{item.quantity.toLocaleString()}</td>
                <td className="p-2 border border-gray-300 print:border-black text-sm text-center">{item.unit}</td>
                <td className="p-2 border border-gray-300 print:border-black text-sm text-right">{item.unitPrice.toLocaleString()}</td>
                <td className="p-2 border border-gray-300 print:border-black text-sm text-right">{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
            {/* Add empty rows if needed to fill space, for print:
            Array.from({ length: Math.max(0, 10 - order.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-8 print:h-10">
                <td className="p-2 border border-gray-300 print:border-black">&nbsp;</td>
                <td className="p-2 border border-gray-300 print:border-black"></td>
                <td className="p-2 border border-gray-300 print:border-black"></td>
                <td className="p-2 border border-gray-300 print:border-black"></td>
                <td className="p-2 border border-gray-300 print:border-black"></td>
                <td className="p-2 border border-gray-300 print:border-black"></td>
              </tr>
            ))*/}
          </tbody>
        </table>
      </section>

      {/* Totals Section */}
      <section className="mb-8 flex justify-end">
        <div className="w-full md:w-1/2 lg:w-1/3 text-sm">
          <div className="flex justify-between p-2 bg-gray-50 print:bg-gray-100">
            <span className="font-semibold">小計:</span>
            <span>¥{order.subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2">
            <span className="font-semibold">消費税 ({((order.taxRate || 0) * 100).toFixed(0)}%):</span>
            <span>¥{order.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-100 print:bg-gray-200 border-t-2 border-b-2 border-gray-300 print:border-black">
            <span className="font-bold text-lg">合計金額:</span>
            <span className="font-bold text-lg">¥{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Notes and Bank Info */}
      <section className="text-sm space-y-4">
        {order.deliverySlipNotes && (
          <div>
            <h3 className="font-semibold mb-1">備考:</h3>
            <p className="whitespace-pre-wrap p-2 border border-gray-200 print:border-gray-400 rounded">
              {order.deliverySlipNotes}
            </p>
          </div>
        )}
        {companyInfo.bankAccount && (
          <div>
            <h3 className="font-semibold mb-1">お振込先:</h3>
            <div className="p-2 border border-gray-200 print:border-gray-400 rounded">
              <p>{companyInfo.bankAccount.bankName} {companyInfo.bankAccount.branchName}</p>
              <p>{companyInfo.bankAccount.accountType} {companyInfo.bankAccount.accountNumber}</p>
              <p>名義: {companyInfo.bankAccount.accountHolder}</p>
            </div>
          </div>
        )}
      </section>

      {/* Footer (optional, e.g., company seal placeholder) */}
      <footer className="mt-12 pt-8 text-center text-xs text-gray-500 print:hidden">
        <p>水戸青果 究極の粗利管理システム</p>
      </footer>
       {/* Placeholder for company seal (hanko) for printed version */}
       <div className="absolute bottom-12 right-12 w-24 h-24 border-2 border-dashed border-gray-400 hidden print:flex items-center justify-center text-gray-400 text-sm">
         社印
       </div>
    </div>
  );
};

export default DeliverySlipPreview;
