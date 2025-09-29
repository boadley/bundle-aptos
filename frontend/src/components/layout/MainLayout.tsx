import React from 'react';
import { 
  IoHomeOutline, 
  IoHome, 
  IoGiftOutline, 
  IoGift,
  IoStatsChartOutline,
  IoStatsChart,
  IoCardOutline,
  IoCard,
  IoPersonOutline,
  IoPerson
} from 'react-icons/io5';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'rewards' | 'finance' | 'cards' | 'me';
}

interface NavItemProps {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, activeIcon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-3 transition-colors duration-200 ${
        isActive ? 'text-accent' : 'text-secondary'
      }`}
    >
      <div className="w-6 h-6 mb-1">
        {isActive ? activeIcon : icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export default function MainLayout({ children, activeTab = 'home' }: MainLayoutProps) {
  const handleNavClick = (tab: string) => {
    if (tab !== 'home') {
      // For now, just show a toast for non-home tabs
      console.log(`${tab} clicked - Coming Soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Main content area */}
      <div className="flex-1 pb-20">
        {children}
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-disabled/20 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavItem
            icon={<IoHomeOutline className="w-full h-full" />}
            activeIcon={<IoHome className="w-full h-full" />}
            label="Home"
            isActive={activeTab === 'home'}
            onClick={() => handleNavClick('home')}
          />
          <NavItem
            icon={<IoGiftOutline className="w-full h-full" />}
            activeIcon={<IoGift className="w-full h-full" />}
            label="Rewards"
            isActive={activeTab === 'rewards'}
            onClick={() => handleNavClick('rewards')}
          />
          <NavItem
            icon={<IoStatsChartOutline className="w-full h-full" />}
            activeIcon={<IoStatsChart className="w-full h-full" />}
            label="Finance"
            isActive={activeTab === 'finance'}
            onClick={() => handleNavClick('finance')}
          />
          <NavItem
            icon={<IoCardOutline className="w-full h-full" />}
            activeIcon={<IoCard className="w-full h-full" />}
            label="Cards"
            isActive={activeTab === 'cards'}
            onClick={() => handleNavClick('cards')}
          />
          <NavItem
            icon={<IoPersonOutline className="w-full h-full" />}
            activeIcon={<IoPerson className="w-full h-full" />}
            label="Me"
            isActive={activeTab === 'me'}
            onClick={() => handleNavClick('me')}
          />
        </div>
      </div>
    </div>
  );
}