
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Product } from '../../types';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface InventoryTakingPageProps {
  initialProducts: Product[];
  onSaveAllCounts: (updatedProducts: Product[]) => void;
  onCancel: () => void;
}

const InventoryTakingPage: React.FC<InventoryTakingPageProps> = ({ initialProducts, onSaveAllCounts, onCancel }) => {
  const [productCounts, setProductCounts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialCounts: Record<string, string> = {};
    initialProducts.forEach(p => {
      initialCounts[p.id] = (p.currentStock ?? 0).toString();
    });
    setProductCounts(initialCounts);
  }, [initialProducts]);

  const handleCountChange = (productId: string, value: string) => {
    setProductCounts(prev => ({ ...prev, [productId]: value }));
    if (errors[productId]) {
      setErrors(prev => ({ ...prev, [productId]: '' }));
    }
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
    const updatedProducts = initialProducts.map(p => ({
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

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {initialProducts.map(product => (
          <div key={product.id} className={`p-3 border rounded-md ${errors[product.id] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <label htmlFor={`count-${product.id}`} className="block text-sm font-medium text-gray-700">
              {product.name} <span className="text-xs text-gray-500">(現在: {product.currentStock ?? 0} {product.unit})</span>
            </label>
            <input
              type="number"
              id={`count-${product.id}`}
              value={productCounts[product.id] || ''}
              onChange={(e) => handleCountChange(product.id, e.target.value)}
              min="0"
              className={`mt-1 block w-full sm:w-48 px-3 py-2 border ${errors[product.id] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            />
            {errors[product.id] && <p className="mt-1 text-xs text-red-600">{errors[product.id]}</p>}
          </div>
        ))}
      </div>
      
      {initialProducts.length === 0 && (
        <p className="text-gray-500 text-center py-5">棚卸対象の商品がありません。</p>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button onClick={onCancel} variant="secondary">
          キャンセル
        </Button>
        <Button onClick={handleSave} variant="primary" disabled={initialProducts.length === 0}>
          すべての棚卸結果を保存
        </Button>
      </div>
    </Card>
  );
};

export default InventoryTakingPage;
