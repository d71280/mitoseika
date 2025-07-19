import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category?: string;
  description?: string;
  created_at?: string;
}

interface ProductFormData {
  name: string;
  price: string;
  unit: string;
  category: string;
  description: string;
}

const ProductMasterPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    unit: '',
    category: '',
    description: ''
  });

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3001`
    : window.location.origin;

  // 商品データを取得
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error('商品取得エラー:', data.error);
        alert('商品データの取得に失敗しました');
      }
    } catch (error) {
      console.error('商品取得エラー:', error);
      alert('商品データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      unit: '',
      category: '',
      description: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // 新規追加ボタン
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // 編集ボタン
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      category: product.category || '',
      description: product.description || ''
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.unit) {
      alert('商品名、価格、単位は必須です');
      return;
    }

    try {
      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          unit: formData.unit,
          category: formData.category || null,
          description: formData.description || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        resetForm();
        fetchProducts();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('商品保存エラー:', error);
      alert('商品の保存に失敗しました');
    }
  };

  // 削除
  const handleDelete = async (product: Product) => {
    if (!confirm(`「${product.name}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchProducts();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('商品削除エラー:', error);
      alert('商品の削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800 mb-2">商品マスタ管理</h1>
        <p className="text-gray-600">商品の登録・編集・削除を行います</p>
      </div>

      {/* 新規追加ボタン */}
      <div className="flex justify-end">
        <Button onClick={handleAddNew} variant="primary">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          新商品追加
        </Button>
      </div>

      {/* 商品一覧 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">登録商品一覧</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>登録されている商品がありません</p>
            <p className="text-sm mt-1">「新商品追加」ボタンから商品を登録してください</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">商品名</th>
                  <th className="text-left py-2 px-4">価格</th>
                  <th className="text-left py-2 px-4">単位</th>
                  <th className="text-left py-2 px-4">カテゴリ</th>
                  <th className="text-left py-2 px-4">説明</th>
                  <th className="text-left py-2 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">¥{product.price.toLocaleString()}</td>
                    <td className="py-3 px-4">{product.unit}</td>
                    <td className="py-3 px-4">{product.category || '-'}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{product.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="編集"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="削除"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 商品フォーム */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? '商品編集' : '新商品追加'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: キャベツ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: 150"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  単位 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="個">個</option>
                  <option value="袋">袋</option>
                  <option value="束">束</option>
                  <option value="箱">箱</option>
                  <option value="ケース">ケース</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="本">本</option>
                  <option value="枚">枚</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: 野菜"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="商品の詳細情報があれば入力してください"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" onClick={resetForm} variant="secondary">
                キャンセル
              </Button>
              <Button type="submit" variant="primary">
                {editingProduct ? '更新' : '追加'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProductMasterPage;