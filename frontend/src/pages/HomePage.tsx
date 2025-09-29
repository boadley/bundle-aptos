import { useState } from 'react';
import Header from '../components/Header';
import MainLayout from '../components/layout/MainLayout';
import BankTransferForm from '../components/BankTransferForm';
import AirtimeForm from '../components/AirtimeForm';
import AvailableBalanceCard from '../components/AvailableBalanceCard';
import QuickActionsRow from '../components/QuickActionsRow';
import TransactionHistorySection from '../components/TransactionHistorySection';
import ServicesGrid from '../components/ServicesGrid';
import { IoChevronBackOutline } from 'react-icons/io5';

type ActiveView = 'home' | 'airtime' | 'bank';

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  const handleAirtimeClick = () => {
    setActiveView('airtime');
  };

  const handleBankTransferClick = () => {
    setActiveView('bank');
  };

  const handleBackToHome = () => {
    setActiveView('home');
  };

  // Mobile-first design with desktop fallback
  return (
    <div className="bg-primary min-h-screen text-white">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {activeView === 'home' ? (
          <MainLayout activeTab="home">
            <Header />
            <main className="p-4">
              <AvailableBalanceCard />
              <QuickActionsRow onBankTransferClick={handleBankTransferClick} />
              <TransactionHistorySection />
              <ServicesGrid onAirtimeClick={handleAirtimeClick} />
            </main>
          </MainLayout>
        ) : (
          <div>
            <Header />
            <main className="p-4">
              <button 
                onClick={handleBackToHome}
                className="flex items-center text-accent mb-6 hover:text-accent/80 transition-colors"
              >
                <IoChevronBackOutline className="w-5 h-5 mr-2" />
                Back
              </button>
              {activeView === 'airtime' && <AirtimeForm />}
              {activeView === 'bank' && <BankTransferForm />}
            </main>
          </div>
        )}
      </div>

      {/* Desktop Layout (unchanged) */}
      <div className="hidden lg:block">
        <Header />
        <main className="p-4 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-left">Welcome back!</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BankTransferForm />
            <AirtimeForm />
          </div>
        </main>
      </div>
    </div>
  );
}
