
import React from 'react'; // Removed useState
import Card from './ui/Card';
import Button from './ui/Button';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { Product, ProductUnit } from '../types'; // Removed mockProductsInventory
import { PageView } from '../App'; // Import PageView

interface InventoryManagementPageProps {
  products: Product[];
  navigateTo: (page: PageView, itemId?: string) => void;
}

const InventoryManagementPage: React.FC<InventoryManagementPageProps> = ({ products, navigateTo }) => {
  
  const getStockLevelClass = (currentStock?: number): string => {
    if (typeof currentStock === 'number') {
      if (currentStock <= 0) return 'text-red-700 bg-red-100 font-bold';
    }
    return 'text-gray-900';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex flex-col sm:flex-row justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800 flex items-center">
          <ArchiveBoxIcon className="w-8 h-8 mr-3 text-green-700" />
          在庫管理
        </h1>
         <Button 
            onClick={() => navigateTo(PageView.INVENTORY_TAKING_PAGE)} 
            variant="secondary" 
            size="md" 
            className="mt-3 sm:mt-0"
         >
          棚卸入力
        </Button>
      </header>

      {products.length === 0 ? (
         <div className="text-center py-10">
          <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-700">登録されている商品在庫情報はありません。</p>
          <p className="text-sm text-gray-500 mt-2">
            商品マスタに商品を登録し、在庫数を設定してください。
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">現在在庫</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">単位</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${
                    (product.currentStock ?? 0) <= 0 ? 'bg-red-50 hover:bg-red-100' : ''
                  }`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getStockLevelClass(product.currentStock)}`}>
                    {product.currentStock ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{product.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateTo(PageView.INVENTORY_ADJUST_PAGE, product.id)} 
                        title="在庫調整"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      <span className="ml-1 hidden sm:inline">調整</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-4">
        <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 mr-1 align-middle"></span> 在庫切れ
      </p>
    </Card>
  );
};

export default InventoryManagementPage;
