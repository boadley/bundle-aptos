import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useBundle } from '../hooks/useBundle';
import { resolveAccount } from '../services/apiService';
import { toast } from 'react-hot-toast';
import { IoCheckmarkCircleOutline, IoTimeOutline } from 'react-icons/io5';
import ConfirmationModal from './ConfirmationModal';

const banks = [
  { name: 'GTBank', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Access Bank', code: '044' },
  { name: 'UBA', code: '033' },
  { name: 'First Bank', code: '011' },
  { name: 'Wema Bank', code: '035' }
];

// Mock recent transfers data
const mockRecentTransfers = [
  { name: 'John Doe', bank: 'GTBank', accountNumber: '0123456789', amount: '₦5,000' },
  { name: 'Jane Smith', bank: 'Zenith Bank', accountNumber: '0987654321', amount: '₦2,500' },
  { name: 'Mike Johnson', bank: 'Access Bank', accountNumber: '0456789123', amount: '₦10,000' }
];



export default function BankTransferForm() {
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'recents' | 'favourites'>('recents');

  const { executePayment, isLoading } = useBundle();
  const navigate = useNavigate();

  // Auto-verify account when account number and bank are complete
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      handleVerifyAccount();
    } else {
      setVerified(false);
      setAccountName('');
    }
  }, [selectedBank, accountNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && selectedBank && accountNumber && accountName && verified) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    if (selectedBank) {
      executePayment(
        'bank', 
        {
          amount: parseFloat(amount),
          bankName: selectedBank.name,
          accountNumber,
          accountName,
        },
        (transactionId) => {
          // Navigate to success page
          navigate('/status', {
            state: {
              status: 'success',
              transactionType: 'bank',
              amount,
              recipient: `${accountName} • ${selectedBank.name} • ${accountNumber}`,
              transactionId,
            }
          });
        },
        (errorMessage) => {
          // Navigate to failure page
          navigate('/status', {
            state: {
              status: 'failed',
              transactionType: 'bank',
              amount,
              recipient: `${accountName} • ${selectedBank.name} • ${accountNumber}`,
              errorMessage,
            }
          });
        }
      );
      setShowConfirmation(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (selectedBank && accountNumber.length === 10) {
      setIsVerifying(true);
      setVerified(false);
      setAccountName('');
      
      try {
        const response = await resolveAccount({ 
          bankName: selectedBank.name, 
          accountNumber 
        });
        setAccountName(response.accountName);
        setVerified(true);
      } catch (error) {
        setAccountName('');
        setVerified(false);
        toast.error('Account verification failed');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleRecentTransferClick = (transfer: typeof mockRecentTransfers[0]) => {
    const bank = banks.find(b => b.name === transfer.bank);
    if (bank) {
      setSelectedBank(bank);
      setAccountNumber(transfer.accountNumber);
      setAccountName(transfer.name);
      setVerified(true);
    }
  };

  const hbarCost = amount ? (parseFloat(amount) * 0.00085).toFixed(4) : '0.0000';

  return (
    <>
      <div className="lg:bg-surface lg:rounded-xl lg:p-6">
        <h2 className="text-2xl font-bold text-white mb-6 lg:text-xl lg:mb-4">Bank Transfer</h2>
        
        <form className="space-y-6 lg:space-y-4" onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div>
            <label className="block text-base text-secondary mb-2">Amount (NGN)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-field"
              required
            />
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-base text-secondary mb-2">Select Bank</label>
            <select
              value={selectedBank?.code || ''}
              onChange={(e) => {
                const bank = banks.find(b => b.code === e.target.value);
                setSelectedBank(bank || null);
              }}
              className="input-field"
              required
            >
              <option value="">Choose bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
          </div>

          {/* Account Number Input */}
          <div>
            <label className="block text-base text-secondary mb-2">Enter 10 digits Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0123456789"
              className="input-field"
              required
              maxLength={10}
            />
            
            {/* Instant Account Verification */}
            <div className="mt-3 min-h-[32px] flex items-center">
              {isVerifying && (
                <div className="flex items-center text-secondary">
                  <div className="w-4 h-4 border-2 border-secondary border-t-accent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm">Verifying account...</span>
                </div>
              )}
              {verified && accountName && (
                <div className="flex items-center text-success">
                  <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
                  <span className="text-base font-semibold">{accountName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank Transfer Success Rate Monitor (UI Placeholder) */}
          <div className="bg-surface/50 rounded-lg p-3 border border-success/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoTimeOutline className="w-4 h-4 text-success mr-2" />
                <span className="text-sm text-white">Bank Transfer Success Rate</span>
              </div>
              <span className="text-success font-bold text-sm">99.8%</span>
            </div>
            <div className="w-full bg-disabled/20 rounded-full h-1 mt-2">
              <div className="bg-success h-1 rounded-full" style={{ width: '99.8%' }}></div>
            </div>
          </div>

          {amount && (
            <div className="text-sm text-secondary">
              Cost: ~{hbarCost} APT
            </div>
          )}

          <Button 
            disabled={!amount || !selectedBank || !accountNumber || !verified || isLoading} 
            isLoading={isLoading}
          >
            Next
          </Button>
        </form>

        {/* Recents and Favourites Tabs */}
        <div className="mt-8">
          <div className="flex border-b border-disabled/20">
            <button
              onClick={() => setActiveTab('recents')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'recents'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Recents
            </button>
            <button
              onClick={() => setActiveTab('favourites')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'favourites'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Favourites
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'recents' && (
              <div className="space-y-3">
                {mockRecentTransfers.map((transfer, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentTransferClick(transfer)}
                    className="w-full flex items-center justify-between p-3 bg-surface/50 rounded-lg hover:bg-surface transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{transfer.name}</p>
                      <p className="text-secondary text-xs">{transfer.bank} • {transfer.accountNumber}</p>
                    </div>
                    <span className="text-accent text-sm font-medium">{transfer.amount}</span>
                  </button>
                ))}
              </div>
            )}
            
            {activeTab === 'favourites' && (
              <div className="text-center py-8">
                <p className="text-secondary">No favourites yet</p>
                <p className="text-secondary text-sm mt-1">Your favourite recipients will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        title="Confirm Bank Transfer"
        description={`You are sending ₦${amount} to ${accountName} at ${selectedBank?.name || ''}.`}
        amount={amount}
        recipient={`${accountName} • ${accountNumber}`}
        transactionType="bank"
        isLoading={isLoading}
      />
    </>
  );
}