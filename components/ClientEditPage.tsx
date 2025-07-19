
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Client } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Product {
  id: string;
  name: string;
  unit: string;
  category?: string;
}

interface ProductPrice {
  productId: string;
  productName: string;
  unit: string;
  price: number;
}

interface ClientEditPageProps {
  clientId: string | 'new';
  existingClients: Client[]; // Used for finding client to edit, or for potential validation
  onSaveClient: (client: Client) => void;
  onCancel: () => void;
}

const ClientEditPage: React.FC<ClientEditPageProps> = ({ clientId, existingClients, onSaveClient, onCancel }) => {
  const isNewClient = clientId === 'new';
  const [clientData, setClientData] = useState<Partial<Client>>({
    customerId: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    ruleSummary: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isNewClient) {
      const currentClient = existingClients.find(c => c.id === clientId);
      if (currentClient) {
        setClientData(currentClient);
        // TODO: Load existing product prices for this client
      } else {
        // Handle case where client ID is not found, though ideally App.tsx prevents this
        console.error(`Client with ID ${clientId} not found.`);
        onCancel(); // Navigate back or show error
      }
    }
  }, [clientId, existingClients, isNewClient, onCancel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Client]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const generateCustomerId = () => {
    // Generate a 4-digit sequential number
    const existingIds = existingClients
      .map(client => client.customerId)
      .filter(id => id && /^\d{4}$/.test(id))
      .map(id => parseInt(id));
    
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const customerId = nextId.toString().padStart(4, '0');
    setClientData(prev => ({ ...prev, customerId }));
  };

  // 商品価格追加
  const addProductPrice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingPrice = productPrices.find(pp => pp.productId === productId);
    if (existingPrice) return; // Already added

    const newPrice: ProductPrice = {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      price: 0
    };

    setProductPrices(prev => [...prev, newPrice]);
  };

  // 商品価格更新
  const updateProductPrice = (productId: string, price: number) => {
    setProductPrices(prev => 
      prev.map(pp => 
        pp.productId === productId ? { ...pp, price } : pp
      )
    );
  };

  // 商品価格削除
  const removeProductPrice = (productId: string) => {
    setProductPrices(prev => prev.filter(pp => pp.productId !== productId));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Client, string>> = {};
    if (!clientData.companyName?.trim()) {
      newErrors.companyName = '会社名は必須です。';
    }
    if (clientData.email && !/\S+@\S+\.\S+/.test(clientData.email)) {
        newErrors.email = '有効なメールアドレスを入力してください。';
    }
    // Add more validation rules as needed (e.g., phone format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const finalClientId = isNewClient ? `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : clientId;
    
    const clientToSave: Client = {
      id: finalClientId,
      customerId: clientData.customerId || undefined,
      companyName: clientData.companyName || '',
      contactPerson: clientData.contactPerson || undefined,
      phone: clientData.phone || undefined,
      email: clientData.email || undefined,
      address: clientData.address || undefined,
      ruleSummary: clientData.ruleSummary || undefined,
    };
    onSaveClient(clientToSave);
  };

  const pageTitle = isNewClient ? '新規顧客追加' : `顧客情報編集 (${clientData.companyName || clientId})`;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
        <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-3 text-green-700" />
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800">{pageTitle}</h1>
        </div>
         <Button onClick={onCancel} variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            顧客一覧へ戻る
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="顧客ID" error={errors.customerId}>
          <div className="flex gap-2">
            <input
              type="text"
              name="customerId"
              id="customerId"
              value={clientData.customerId || ''}
              onChange={handleChange}
              className="mt-1 block flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="例: 0001"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={generateCustomerId}
              className="mt-1 px-4 py-2 text-sm"
            >
              自動採番
            </Button>
          </div>
        </FormField>

        <FormField label="会社名" error={errors.companyName}>
          <input
            type="text"
            name="companyName"
            id="companyName"
            value={clientData.companyName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            required
          />
        </FormField>

        <FormField label="担当者名" error={errors.contactPerson}>
          <input
            type="text"
            name="contactPerson"
            id="contactPerson"
            value={clientData.contactPerson || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </FormField>

        <FormField label="電話番号" error={errors.phone}>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={clientData.phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </FormField>

        <FormField label="メールアドレス" error={errors.email}>
          <input
            type="email"
            name="email"
            id="email"
            value={clientData.email || ''}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          />
        </FormField>
        
        <FormField label="住所" error={errors.address}>
          <input
            type="text"
            name="address"
            id="address"
            value={clientData.address || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </FormField>

        <FormField label="ルール概要・特記事項" error={errors.ruleSummary}>
          <textarea
            name="ruleSummary"
            id="ruleSummary"
            rows={3}
            value={clientData.ruleSummary || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="例: キャベツは1個=6玉入り1箱として計算。トマトは赤熟指定。"
          />
        </FormField>

        {/* 商品別価格設定 */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">商品別価格設定</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">商品を読み込み中...</p>
            </div>
          ) : (
            <>
              {/* 商品追加セレクト */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品を追加
                </label>
                <div className="flex gap-2">
                  <select
                    id="product-select"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    defaultValue=""
                  >
                    <option value="">商品を選択してください</option>
                    {products
                      .filter(product => !productPrices.find(pp => pp.productId === product.id))
                      .map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </option>
                      ))
                    }
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const select = document.getElementById('product-select') as HTMLSelectElement;
                      if (select.value) {
                        addProductPrice(select.value);
                        select.value = '';
                      }
                    }}
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-1" />
                    追加
                  </Button>
                </div>
              </div>

              {/* 設定済み商品価格一覧 */}
              {productPrices.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">設定済み商品価格</h4>
                  {productPrices.map(productPrice => (
                    <div key={productPrice.productId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{productPrice.productName}</div>
                        <div className="text-sm text-gray-500">単位: {productPrice.unit}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={productPrice.price}
                          onChange={(e) => updateProductPrice(productPrice.productId, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-gray-600">円</span>
                        <button
                          type="button"
                          onClick={() => removeProductPrice(productPrice.productId)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="削除"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>まだ商品価格が設定されていません</p>
                  <p className="text-sm mt-1">上記のセレクトボックスから商品を追加してください</p>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p>商品マスタに商品が登録されていません</p>
                  <p className="text-sm mt-1">商品マスタページから商品を登録してください</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary">
            {isNewClient ? '顧客を追加' : '変更を保存'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, error }) => (
  <div>
    <label htmlFor={children && (children as any).props.name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default ClientEditPage;
