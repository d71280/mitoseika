
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Product } from '../../types';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface InventoryAdjustPageProps {
  productId: string | null;
  initialProducts: Product[];
  onSaveAdjustment: (productId: string, newStock: number) => void;
  onCancel: () => void;
}

const InventoryAdjustPage: React.FC<InventoryAdjustPageProps> = ({ productId, initialProducts, onSaveAdjustment, onCancel }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (productId) {
      const foundProduct = initialProducts.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setNewStockValue((foundProduct.currentStock ?? 0).toString());
      } else {
        // Product not found, should ideally not happen if routing is correct
        onCancel(); 
      }
    } else {
      onCancel(); // No product ID provided
    }
  }, [productId, initialProducts, onCancel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStockValue(e.target.value);
    if (error) setError('');
  };

  const validate = (): boolean => {
    const stockNum = parseInt(newStockValue, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('在庫数は0以上の有効な数値で入力してください。');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !validate()) {
      return;
    }
    onSaveAdjustment(product.id, parseInt(newStockValue, 10));
  };

  if (!product) {
    // This case should be handled by useEffect redirecting, but as a fallback:
    return (
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-6 rounded-xl">
            <p className="text-center text-red-500">調整対象の商品が見つかりません。</p>
            <div className="mt-4 text-center">
                <Button onClick={onCancel} variant="secondary">在庫管理へ戻る</Button>
            </div>
        </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
         <div className="flex items-center">
            <PencilSquareIcon className="w-8 h-8 mr-3 text-blue-700" />
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">在庫調整: {product.name}</h1>
        </div>
         <Button onClick={onCancel} variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            在庫管理へ戻る
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">商品名: <span className="font-medium text-gray-700">{product.name}</span></p>
          <p className="text-sm text-gray-500">カテゴリ: <span className="font-medium text-gray-700">{product.category}</span></p>
          <p className="text-sm text-gray-500">現在の記録在庫: <span className="font-medium text-gray-700">{product.currentStock ?? 0} {product.unit}</span></p>
        </div>
        
        <div>
          <label htmlFor="newStockValue" className="block text-sm font-medium text-gray-700">
            新しい在庫数 ({product.unit}):
          </label>
          <input
            type="number"
            id="newStockValue"
            value={newStockValue}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full sm:w-1/2 md:w-1/3 px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            required
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary">
            在庫を更新
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default InventoryAdjustPage;
