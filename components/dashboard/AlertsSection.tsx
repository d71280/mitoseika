
import React from 'react';
import { AlertItemData, AlertActionType } from '../../types';
import Card from '../ui/Card';
import AlertItemDisplay from './AlertItemDisplay';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

const AlertsSection: React.FC = () => {
  const alertItems: AlertItemData[] = [
    {
      id: 'alert1',
      productName: 'キャベツ',
      message: '在庫不足15個',
      actionText: '仕入先へ電話',
      actionType: AlertActionType.CALL,
    },
    {
      id: 'alert2',
      productName: 'トマト',
      message: '異常注文量+200%',
      actionText: '確認要',
      actionType: AlertActionType.CONFIRM,
    },
    {
      id: 'alert3',
      productName: 'レタス',
      message: '粗利率-5%低下',
      actionText: '価格見直し',
      actionType: AlertActionType.REVIEW,
    },
  ];

  return (
    <Card className="bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-600" />
        緊急対応が必要な商品
      </h2>
      <div className="space-y-3">
        {alertItems.map((item) => (
          <AlertItemDisplay key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
};

export default AlertsSection;
