
import React from 'react'; // Removed useState as local client state is gone
import Card from './ui/Card';
import Button from './ui/Button';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { Client } from '../types'; 
import { PageView } from '../App'; // Import PageView

interface ClientManagementPageProps {
  clients: Client[];
  navigateTo: (page: PageView, itemId?: string | 'new') => void;
  onDeleteClient: (clientId: string) => void;
}

const ClientManagementPage: React.FC<ClientManagementPageProps> = ({ clients, navigateTo, onDeleteClient }) => {
  
  const handleAddNewClient = () => {
    navigateTo(PageView.CLIENT_EDIT_PAGE, 'new');
  };

  const handleEditClient = (client: Client) => {
    navigateTo(PageView.CLIENT_EDIT_PAGE, client.id);
  };

  // Delete handler now calls the prop from App.tsx
  const handleDeleteClient = (clientId: string) => {
    onDeleteClient(clientId);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl p-4 sm:p-6 rounded-xl">
      <header className="mb-6 pb-4 border-b border-gray-300 flex flex-col sm:flex-row justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800 flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-3 text-green-700" />
          顧客管理
        </h1>
        <Button onClick={handleAddNewClient} variant="primary" size="md" className="mt-3 sm:mt-0">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          新規顧客を追加
        </Button>
      </header>

      {clients.length === 0 ? (
        <div className="text-center py-10">
          <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-700">登録されている顧客情報はありません。</p>
          <p className="text-sm text-gray-500 mt-2">
            「新規顧客を追加」ボタンから顧客情報を登録してください。
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ルール概要</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.contactPerson || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-normal text-xs text-gray-500 max-w-xs">{client.ruleSummary || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)} title="編集">
                      <PencilSquareIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)} title="削除">
                      <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ClientManagementPage;
