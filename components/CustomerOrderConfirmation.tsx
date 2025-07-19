import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { CheckIcon } from './icons/CheckIcon';

interface OrderData {
  customerId: string;
  clientId: string;
  customerInfo: {
    companyName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  deliveryDate: string;
  notes: string;
  totalAmount: number;
  orderDate: string;
}

interface CustomerOrderConfirmationProps {
  orderData: OrderData;
  onNewOrder: () => void;
}

const CustomerOrderConfirmation: React.FC<CustomerOrderConfirmationProps> = ({
  orderData,
  onNewOrder
}) => {
  const orderNumber = `ON-${orderData.orderDate.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white shadow-xl rounded-xl p-8">
        {/* 成功メッセージ */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">注文を受け付けました</h1>
          <p className="text-gray-600">
            ご注文ありがとうございます。以下の内容で承りました。
          </p>
        </div>

        {/* 注文番号 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">注文番号</p>
            <p className="text-2xl font-bold text-green-800">{orderNumber}</p>
          </div>
        </div>

        {/* 顧客情報 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            ご注文者情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">顧客ID:</span>
              <p className="font-medium">{orderData.customerId}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">会社名:</span>
              <p className="font-medium">{orderData.customerInfo.companyName}</p>
            </div>
            {orderData.customerInfo.contactPerson && (
              <div>
                <span className="text-sm font-medium text-gray-600">担当者:</span>
                <p className="font-medium">{orderData.customerInfo.contactPerson}</p>
              </div>
            )}
            {orderData.customerInfo.phone && (
              <div>
                <span className="text-sm font-medium text-gray-600">電話番号:</span>
                <p className="font-medium">{orderData.customerInfo.phone}</p>
              </div>
            )}
            {orderData.customerInfo.address && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">お届け先:</span>
                <p className="font-medium">{orderData.customerInfo.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* 注文内容 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            ご注文内容
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                    商品名
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">
                    数量
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">
                    単価
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">
                    小計
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderData.orderItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      {item.productName}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {item.quantity}{item.unit}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      ¥{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      ¥{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-4 py-3 text-right font-semibold bg-gray-50">
                    合計金額
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold text-lg bg-gray-50">
                    ¥{orderData.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 配送情報 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            配送情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">注文日:</span>
              <p className="font-medium">{orderData.orderDate}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">希望納品日:</span>
              <p className="font-medium">{orderData.deliveryDate}</p>
            </div>
            {orderData.notes && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">備考:</span>
                <p className="font-medium">{orderData.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 重要事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">重要事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 注文の変更・キャンセルは配送日前日の14:00までにお電話でご連絡ください。</li>
            <li>• 配送時間は8:00～12:00の間を予定しております。</li>
            <li>• 天候や交通状況により配送時間が前後する場合があります。</li>
            <li>• ご不明な点がございましたら、お気軽にお問い合わせください。</li>
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewOrder}
            variant="primary"
            className="px-8 py-3"
          >
            新しい注文を作成
          </Button>
          <Button
            onClick={() => window.print()}
            variant="secondary"
            className="px-8 py-3"
          >
            注文確認書を印刷
          </Button>
        </div>

        {/* お問い合わせ情報 */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            お問い合わせ・ご不明な点がございましたら
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-lg font-semibold text-green-800">
              📞 029-123-4567
            </span>
            <span className="text-sm text-gray-500">
              (営業時間: 6:00 - 14:00)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerOrderConfirmation;