import React from 'react';
import { 
  IoBusiness, 
  IoWalletOutline, 
  IoCardOutline, 
  IoDownloadOutline 
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

function QuickActionButton({ icon, label, onClick, isActive = true }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-colors duration-200 ${
        isActive 
          ? 'bg-surface hover:bg-surface/80 text-white' 
          : 'bg-surface/50 text-secondary cursor-not-allowed'
      }`}
      disabled={!isActive}
    >
      <div className={`w-8 h-8 ${isActive ? 'text-accent' : 'text-secondary'}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

interface QuickActionsRowProps {
  onBankTransferClick: () => void;
}

export default function QuickActionsRow({ onBankTransferClick }: QuickActionsRowProps) {
  const handleComingSoon = (feature: string) => {
    toast.success(`${feature} - Coming Soon!`);
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-3">
        <QuickActionButton
          icon={<IoBusiness className="w-full h-full" />}
          label="To Bank"
          onClick={onBankTransferClick}
        />
        <QuickActionButton
          icon={<IoWalletOutline className="w-full h-full" />}
          label="To OPay"
          onClick={() => handleComingSoon('OPay Transfer')}
          isActive={false}
        />
        <QuickActionButton
          icon={<IoCardOutline className="w-full h-full" />}
          label="To Card"
          onClick={() => handleComingSoon('Card Transfer')}
          isActive={false}
        />
        <QuickActionButton
          icon={<IoDownloadOutline className="w-full h-full" />}
          label="Withdraw"
          onClick={() => handleComingSoon('Withdraw')}
          isActive={false}
        />
      </div>
    </div>
  );
}