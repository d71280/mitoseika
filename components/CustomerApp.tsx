import React, { useState } from 'react';
import CustomerOrderForm from './CustomerOrderForm';
import CustomerOrderConfirmation from './CustomerOrderConfirmation';

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

const CustomerApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'order' | 'confirmation'>('order');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handleOrderSubmit = (data: OrderData) => {
    setOrderData(data);
    setCurrentStep('confirmation');
  };

  const handleNewOrder = () => {
    setOrderData(null);
    setCurrentStep('order');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">水</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">水戸青果</h1>
                <p className="text-sm text-gray-600">オンライン注文システム</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">営業時間: 6:00 - 14:00</p>
              <p className="text-sm text-gray-600">TEL: 029-123-4567</p>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {currentStep === 'order' ? (
          <CustomerOrderForm onSubmitOrder={handleOrderSubmit} />
        ) : (
          <CustomerOrderConfirmation 
            orderData={orderData!} 
            onNewOrder={handleNewOrder} 
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">水戸青果株式会社</h3>
              <p className="text-gray-300 text-sm">
                〒310-0015<br />
                茨城県水戸市宮町1-1-1<br />
                水戸ビルディング 3F
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
              <p className="text-gray-300 text-sm">
                電話: 029-123-4567<br />
                FAX: 029-123-4568<br />
                Email: info@mitoseika.example.com
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">営業時間</h3>
              <p className="text-gray-300 text-sm">
                月曜日 - 土曜日: 6:00 - 14:00<br />
                日曜日・祝日: 休業<br />
                注文締切: 当日6:00まで
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 水戸青果株式会社. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerApp;