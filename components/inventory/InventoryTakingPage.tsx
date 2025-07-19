
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Product } from '../../types';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface InventoryTakingPageProps {
  initialProducts: Product[];
  onSaveAllCounts: (updatedProducts: Product[]) => void;
  onCancel: () => void;
}

const InventoryTakingPage: React.FC<InventoryTakingPageProps> = ({ initialProducts, onSaveAllCounts, onCancel }) => {
  const [productCounts, setProductCounts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3001`
    : window.location.origin;

  // 商品マスタデータを取得
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setAllProducts(data.products || []);
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
    const initialCounts: Record<string, string> = {};
    initialProducts.forEach(p => {
      initialCounts[p.id] = (p.currentStock ?? 0).toString();
    });
    setProductCounts(initialCounts);
    setSelectedProducts(initialProducts);
  }, [initialProducts]);

  const handleCountChange = (productId: string, value: string) => {
    setProductCounts(prev => ({ ...prev, [productId]: value }));
    if (errors[productId]) {
      setErrors(prev => ({ ...prev, [productId]: '' }));
    }
  };

  // 商品追加
  const addProduct = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingProduct = selectedProducts.find(p => p.id === productId);
    if (existingProduct) return; // 既に追加済み

    const newProduct: Product = {
      ...product,
      currentStock: 0 // デフォルト在庫数
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setProductCounts(prev => ({ ...prev, [productId]: '0' }));
  };

  // 商品削除
  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    setProductCounts(prev => {
      const { [productId]: removed, ...rest } = prev;
      return rest;
    });
    setErrors(prev => {
      const { [productId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const validateAllCounts = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    for (const productId in productCounts) {
      const count = parseInt(productCounts[productId], 10);
      if (isNaN(count) || count < 0) {
        newErrors[productId] = '0以上の数値を入力してください。';
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateAllCounts()) {
      alert('入力内容にエラーがあります。確認してください。');
      return;
    }
    const updatedProducts = selectedProducts.map(p => ({
      ...p,
      currentStock: parseInt(productCounts[p.id], 10),
    }));
    onSaveAllCounts(updatedProducts);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
        <div className="flex items-center">
            <ArchiveBoxIcon className="w-8 h-8 mr-3 text-green-700" />
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800">棚卸入力</h1>
        </div>
         <Button onClick={onCancel} variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            在庫管理へ戻る
        </Button>
      </header>

      <p className="text-sm text-gray-600 mb-4">各商品の実際の在庫数を入力してください。</p>

      {/* 商品追加セクション */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">商品を読み込み中...</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">商品を追加</h3>
          <div className="flex gap-2">
            <select
              id="product-select"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              defaultValue=""
            >
              <option value="">商品を選択してください</option>
              {allProducts
                .filter(product => !selectedProducts.find(sp => sp.id === product.id))
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
                  addProduct(select.value);
                  select.value = '';
                }
              }}
            >
              <PlusCircleIcon className="w-4 h-4 mr-1" />
              追加
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {selectedProducts.map(product => (
          <div key={product.id} className={`p-3 border rounded-md ${errors[product.id] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label htmlFor={`count-${product.id}`} className="block text-sm font-medium text-gray-700">
                  {product.name} <span className="text-xs text-gray-500">(現在: {product.currentStock ?? 0} {product.unit})</span>
                </label>
                <div className="flex items-center mt-1 gap-2">
                  <input
                    type="number"
                    id={`count-${product.id}`}
                    value={productCounts[product.id] || ''}
                    onChange={(e) => handleCountChange(product.id, e.target.value)}
                    min="0"
                    className={`block w-24 px-3 py-2 border ${errors[product.id] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  />
                  <span className="text-sm text-gray-600">{product.unit}</span>
                </div>
                {errors[product.id] && <p className="mt-1 text-xs text-red-600">{errors[product.id]}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="ml-2 p-1 text-red-600 hover:text-red-800"
                title="削除"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedProducts.length === 0 && (
        <p className="text-gray-500 text-center py-5">棚卸対象の商品がありません。上記から商品を追加してください。</p>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button onClick={onCancel} variant="secondary">
          キャンセル
        </Button>
        <Button onClick={handleSave} variant="primary" disabled={selectedProducts.length === 0}>
          すべての棚卸結果を保存
        </Button>
      </div>
    </Card>
  );
};

export default InventoryTakingPage;
