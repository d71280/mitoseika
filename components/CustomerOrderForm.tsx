import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Product, ProductUnit, Client } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

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
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3001`
    : window.location.origin;

  // 商品データを取得
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error('商品取得エラー:', data.error);
      }
    } catch (error) {
      console.error('商品取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 顧客データを取得
  const fetchClient = async (customerIdValue: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      const data = await response.json();
      
      if (data.success) {
        const client = data.clients.find((c: Client) => c.customerId === customerIdValue);
        if (client) {
          setSelectedClient(client);
          setError('');
        } else {
          setSelectedClient(null);
          setError('顧客IDが見つかりません');
        }
      } else {
        console.error('顧客取得エラー:', data.error);
        setError('顧客データの取得に失敗しました');
      }
    } catch (error) {
      console.error('顧客取得エラー:', error);
      setError('顧客データの取得に失敗しました');
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchProducts();
  }, []);

  // 顧客IDが入力されたら顧客情報を自動取得
  useEffect(() => {
    if (customerId) {
      fetchClient(customerId);
    } else {
      setSelectedClient(null);
      setError('');
    }
  }, [customerId]);

  // 商品をあいうえお順にソート
  const sortedProducts = [...products].sort((a, b) => 
    a.name.localeCompare(b.name, 'ja')
  );

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
          // デフォルト価格として購入価格を使用（実際のシステムでは顧客別価格を取得）
          const price = product.salePrice || product.purchasePrice || 0;
          total += price * quantity;
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
          const price = product.salePrice || product.purchasePrice || 0;
          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity,
            unit: product.unit,
            unitPrice: price,
            totalPrice: price * quantity
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
      deliveryDate: new Date().toISOString().split('T')[0], // 自動的に今日の日付を設定
      notes: '',
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
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-4 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">商品を読み込み中...</p>
                      </td>
                    </tr>
                  ) : sortedProducts.map(product => {
                    const quantity = parseInt(productQuantities[product.id] || '0') || 0;
                    const price = product.salePrice || product.purchasePrice || 0;
                    const subtotal = quantity * price;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {product.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          ¥{price.toLocaleString()}/{product.unit}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="text"
                            value={productQuantities[product.id] || ''}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            placeholder=""
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


          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setCustomerId('');
                setSelectedClient(null);
                setProductQuantities({});
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