
import React from 'react';
import { AlertItemData, AlertActionType } from '../../types';
import Button from '../ui/Button';
import { PhoneIcon } from '../icons/PhoneIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface AlertItemDisplayProps {
  item: AlertItemData;
}

const AlertItemDisplay: React.FC<AlertItemDisplayProps> = ({ item }) => {
  const getIconForAction = (actionType?: AlertActionType) => {
    switch (actionType) {
      case AlertActionType.CALL:
        return <PhoneIcon className="w-4 h-4 mr-2" />;
      case AlertActionType.REVIEW:
        return <PencilSquareIcon className="w-4 h-4 mr-2" />;
      case AlertActionType.CONFIRM:
        return <CheckCircleIcon className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };
  
  const getButtonVariant = (actionType?: AlertActionType) => {
    switch (actionType) {
      case AlertActionType.CALL:
        return "primary";
      case AlertActionType.REVIEW:
        return "warning";
      case AlertActionType.CONFIRM:
        return "info";
      default:
        return "secondary";
    }
  }


  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div className="mb-2 sm:mb-0">
        <span className="font-semibold text-red-700">{item.productName}：</span>
        <span className="text-red-600">{item.message}</span>
      </div>
      {item.actionText && (
        <Button 
          size="sm" 
          variant={getButtonVariant(item.actionType)}
          className="w-full sm:w-auto flex-shrink-0"
        >
          {getIconForAction(item.actionType)}
          {item.actionText}
        </Button>
      )}
    </div>
  );
};

export default AlertItemDisplay;
