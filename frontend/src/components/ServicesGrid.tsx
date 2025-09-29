import React from 'react';
import { 
  IoPhonePortraitOutline,
  IoWifiOutline,
  IoGameControllerOutline,
  IoTvOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoEllipsisHorizontalOutline
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

interface ServiceItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

function ServiceItem({ icon, label, onClick, isActive = true }: ServiceItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-colors duration-200 ${
        isActive 
          ? 'bg-surface hover:bg-surface/80 text-white' 
          : 'bg-surface/50 text-secondary'
      }`}
      disabled={!isActive}
    >
      <div className={`w-8 h-8 ${isActive ? 'text-accent' : 'text-secondary'}`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
}

interface ServicesGridProps {
  onAirtimeClick: () => void;
}

export default function ServicesGrid({ onAirtimeClick }: ServicesGridProps) {
  const handleComingSoon = (service: string) => {
    toast.success(`${service} - Coming Soon!`);
  };

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
      
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <ServiceItem
          icon={<IoPhonePortraitOutline className="w-full h-full" />}
          label="Airtime"
          onClick={onAirtimeClick}
        />
        <ServiceItem
          icon={<IoWifiOutline className="w-full h-full" />}
          label="Data"
          onClick={() => handleComingSoon('Data')}
          isActive={false}
        />
        <ServiceItem
          icon={<IoGameControllerOutline className="w-full h-full" />}
          label="Betting"
          onClick={() => handleComingSoon('Betting')}
          isActive={false}
        />
        <ServiceItem
          icon={<IoTvOutline className="w-full h-full" />}
          label="TV"
          onClick={() => handleComingSoon('TV')}
          isActive={false}
        />
        
        {/* Row 2 */}
        <ServiceItem
          icon={<IoShieldCheckmarkOutline className="w-full h-full" />}
          label="Safebox"
          onClick={() => handleComingSoon('Safebox')}
          isActive={false}
        />
        <ServiceItem
          icon={<IoCashOutline className="w-full h-full" />}
          label="Loan"
          onClick={() => handleComingSoon('Loan')}
          isActive={false}
        />
        <ServiceItem
          icon={<IoCheckmarkCircleOutline className="w-full h-full" />}
          label="Check-In"
          onClick={() => handleComingSoon('Check-In')}
          isActive={false}
        />
        <ServiceItem
          icon={<IoEllipsisHorizontalOutline className="w-full h-full" />}
          label="More"
          onClick={() => handleComingSoon('More Services')}
          isActive={false}
        />
      </div>
    </div>
  );
}