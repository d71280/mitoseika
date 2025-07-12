import React, { useState } from 'react';
import Card from './ui/Card';
// PageHeader import removed
import Button from './ui/Button';
import { Supplier } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

const initialSuppliers: Supplier[] = [
  { id: 'sup1', name: '新鮮野菜ファーム', contactPerson: '山田太郎', phone: '090-1234-5678', email: 'yamada@freshfarm.com' },
  { id: 'sup2', name: '大地の実り卸売', contactPerson: '鈴木花子', phone: '080-9876-5432', email: 'suzuki@daichi-minori.jp' },
  { id: 'sup3', name: 'こだわり青果店', contactPerson: '田中一郎', phone: '070-1122-3344', email: 'tanaka@kodawari-fruits.net' },
];

// onNavigateBack prop removed
const SupplierListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [showAddModal, setShowAddModal] = useState(false); // For future modal implementation

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('この仕入先を本当に削除しますか？')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };
  
  const handleAddSupplier = () => {
    // In a real app, this would open a form/modal
    const newId = `sup${suppliers.length + 1}${Date.now()}`;
    const newSupplier: Supplier = {
      id: newId,
      name: `新規仕入先 ${suppliers.length + 1}`,
      contactPerson: "未設定",
      phone: "未設定",
      email: "未設定",
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    // setShowAddModal(true); // Open modal
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">仕入先一覧</h1>
        <Button onClick={handleAddSupplier} variant="primary" size="md">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          新規仕入先を追加
        </Button>
      </header>
      
      {suppliers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">登録されている仕入先はありません。</p>
          <p className="text-gray-400 text-sm mt-2">「新規仕入先を追加」ボタンから登録してください。</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">仕入先名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.contactPerson || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => alert(`編集機能（仕入先ID: ${supplier.id}）は開発中です。`)} title="編集">
                      <PencilSquareIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.id)} title="削除">
                      <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add/Edit Modal would go here */}
    </Card>
  );
};

export default SupplierListPage;