
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Client } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface ClientEditPageProps {
  clientId: string | 'new';
  existingClients: Client[]; // Used for finding client to edit, or for potential validation
  onSaveClient: (client: Client) => void;
  onCancel: () => void;
}

const ClientEditPage: React.FC<ClientEditPageProps> = ({ clientId, existingClients, onSaveClient, onCancel }) => {
  const isNewClient = clientId === 'new';
  const [clientData, setClientData] = useState<Partial<Client>>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    ruleSummary: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});

  useEffect(() => {
    if (!isNewClient) {
      const currentClient = existingClients.find(c => c.id === clientId);
      if (currentClient) {
        setClientData(currentClient);
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
