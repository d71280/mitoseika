
import React from 'react';
import { AlertItemData, AlertActionType, ProductUnit } from '../../types';
import Card from '../ui/Card';
import AlertItemDisplay from './AlertItemDisplay';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

const AlertsSection: React.FC = () => {
  const alertItems: AlertItemData[] = [
    {
      id: 'alert1',
      productName: 'キャベツ',
      message: '仕入れが必要です',
      actionText: '仕入先へ電話',
      actionType: AlertActionType.CALL,
    },
    {
      id: 'alert2',
      productName: 'トマト',
      message: '仕入れが必要です',
      actionText: '仕入先へ電話',
      actionType: AlertActionType.CALL,
    },
    {
      id: 'alert3',
      productName: 'レタス',
      message: '仕入れが必要です',
      actionText: '仕入先へ電話',
      actionType: AlertActionType.CALL,
    },
  ];

  // Filter to show only products that need ordering
  const productsNeedingOrders = alertItems.filter(item => 
    item.message.includes('仕入れが必要')
  );

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-600" />
        仕入れが必要な商品
      </h2>
      <div className="space-y-3">
        {productsNeedingOrders.map((item) => (
          <AlertItemDisplay key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
};

export default AlertsSection;
