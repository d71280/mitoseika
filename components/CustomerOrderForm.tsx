import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Product, ProductUnit, Client, mockClients } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { mockProductsInventory } from '../types';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  totalPrice: number;
}

interface CustomerOrderFormProps {
  onSubmitOrder?: (orderData: any) => void;
}

const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({ onSubmitOrder }) => {
  const [customerId, setCustomerId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [productQuantities, setProductQuantities] = useState<Record<string, string>>({});
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // 商品をあいうえお順にソート
  const sortedProducts = [...mockProductsInventory].sort((a, b) => 
    a.name.localeCompare(b.name, 'ja')
  );

  // 顧客IDが入力されたら顧客情報を自動取得
  useEffect(() => {
    if (customerId) {
      const client = mockClients.find(c => c.customerId === customerId);
      if (client) {
        setSelectedClient(client);
        setError('');
      } else {
        setSelectedClient(null);
        setError('顧客IDが見つかりません');
      }
    } else {
      setSelectedClient(null);
      setError('');
    }
  }, [customerId]);

  const handleQuantityChange = (productId: string, value: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(productQuantities).forEach(([productId, quantityStr]) => {
      const quantity = parseInt(quantityStr) || 0;
      if (quantity > 0) {
        const product = sortedProducts.find(p => p.id === productId);
        if (product) {
          total += product.salePrice * quantity;
        }
      }
    });
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      setError('顧客IDを正しく入力してください');
      return;
    }

    const orderItems: OrderItem[] = [];
    Object.entries(productQuantities).forEach(([productId, quantityStr]) => {
      const quantity = parseInt(quantityStr) || 0;
      if (quantity > 0) {
        const product = sortedProducts.find(p => p.id === productId);
        if (product) {
          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity,
            unit: product.unit,
            unitPrice: product.salePrice,
            totalPrice: product.salePrice * quantity
          });
        }
      }
    });

    if (orderItems.length === 0) {
      setError('商品を選択してください');
      return;
    }

    const orderData = {
      customerId: selectedClient.customerId,
      clientId: selectedClient.id,
      customerInfo: {
        companyName: selectedClient.companyName,
        contactPerson: selectedClient.contactPerson,
        phone: selectedClient.phone,
        email: selectedClient.email,
        address: selectedClient.address
      },
      orderItems,
      deliveryDate,
      notes,
      totalAmount: calculateTotal(),
      orderDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('注文データ:', orderData);
    if (onSubmitOrder) {
      onSubmitOrder(orderData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-green-800 mb-6 flex items-center">
          <ShoppingCartIcon className="w-8 h-8 mr-3" />
          注文フォーム
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 顧客ID入力セクション */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">顧客情報</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                顧客ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="例: 0001"
                required
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            
            {selectedClient && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">顧客情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">会社名:</span> {selectedClient.companyName}</div>
                  {selectedClient.contactPerson && (
                    <div><span className="font-medium">担当者:</span> {selectedClient.contactPerson}</div>
                  )}
                  {selectedClient.phone && (
                    <div><span className="font-medium">電話:</span> {selectedClient.phone}</div>
                  )}
                  {selectedClient.address && (
                    <div className="md:col-span-2"><span className="font-medium">住所:</span> {selectedClient.address}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 商品注文セクション */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">商品注文</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">商品名</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">単価</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">注文数</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map(product => {
                    const quantity = parseInt(productQuantities[product.id] || '0') || 0;
                    const subtotal = quantity * product.salePrice;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {product.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          ¥{product.salePrice}/{product.unit}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="text"
                            value={productQuantities[product.id] || ''}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            placeholder="0"
                          />
                          <span className="ml-1">{product.unit}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {quantity > 0 ? `¥${subtotal.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="border border-gray-300 px-4 py-3 text-right font-semibold">
                      合計金額
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-lg">
                      ¥{calculateTotal().toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 配送情報 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">配送情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  希望納品日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考・特記事項
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="配送時間帯、特別な要望など"
                />
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setCustomerId('');
                setSelectedClient(null);
                setProductQuantities({});
                setDeliveryDate('');
                setNotes('');
                setError('');
              }}
            >
              クリア
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!selectedClient}
              className="px-8"
            >
              注文を送信
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerOrderForm;