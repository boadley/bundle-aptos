import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useBundle } from '../hooks/useBundle';
import ConfirmationModal from './ConfirmationModal';

// Network data with colors for visual representation
const networks = [
  { name: 'MTN', code: 'MTN', color: '#FFCC00', textColor: '#000' },
  { name: 'Glo', code: 'Glo', color: '#00A651', textColor: '#fff' },
  { name: 'Airtel', code: 'Airtel', color: '#FF0000', textColor: '#fff' },
  { name: '9mobile', code: '9mobile', color: '#00A86B', textColor: '#fff' }
];

// Preset amounts with cashback
const presetAmounts = [
  { amount: 50, cashback: 2 },
  { amount: 100, cashback: 5 },
  { amount: 200, cashback: 10 },
  { amount: 500, cashback: 25 },
  { amount: 1000, cashback: 50 },
  { amount: 2000, cashback: 100 }
];



export default function AirtimeForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<typeof networks[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { executePayment, isLoading } = useBundle();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber && selectedNetwork && amount) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    if (selectedNetwork) {
      executePayment(
        'airtime', 
        {
          phoneNumber,
          network: selectedNetwork.code,
          amount: parseFloat(amount),
        },
        (transactionId) => {
          // Navigate to success page
          navigate('/status', {
            state: {
              status: 'success',
              transactionType: 'airtime',
              amount,
              recipient: `${phoneNumber} (${selectedNetwork.name})`,
              transactionId,
            }
          });
        },
        (errorMessage) => {
          // Navigate to failure page
          navigate('/status', {
            state: {
              status: 'failed',
              transactionType: 'airtime',
              amount,
              recipient: `${phoneNumber} (${selectedNetwork.name})`,
              errorMessage,
            }
          });
        }
      );
      setShowConfirmation(false);
    }
  };

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const hbarCost = amount ? (parseFloat(amount) * 0.00085).toFixed(4) : '0.0000';

  return (
    <>
      <div className="lg:bg-surface lg:rounded-xl lg:p-6">
        <h2 className="text-2xl font-bold text-white mb-6 lg:text-xl lg:mb-4">Buy Airtime</h2>
        
        <form className="space-y-6 lg:space-y-4" onSubmit={handleSubmit}>
          {/* Phone Number Input with Network Selection */}
          <div>
            <label className="block text-base text-secondary mb-3">Phone Number</label>
            
            {/* Network Carousel */}
            <div className="flex space-x-2 mb-3">
              {networks.map((network) => (
                <button
                  key={network.code}
                  type="button"
                  onClick={() => setSelectedNetwork(network)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    selectedNetwork?.code === network.code
                      ? 'ring-2 ring-accent scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: network.color, 
                    color: network.textColor 
                  }}
                >
                  {network.name === '9mobile' ? '9M' : network.name.slice(0, 3)}
                </button>
              ))}
            </div>
            
            {/* Phone Number Input */}
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="input-field"
              required
            />
          </div>

          {/* Top-Up Amount Selection */}
          <div>
            <label className="block text-base text-secondary mb-3">Top-Up Amount</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => handlePresetAmount(preset.amount)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    amount === preset.amount.toString()
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-disabled bg-surface text-white hover:border-accent/50'
                  }`}
                >
                  <div className="text-sm font-bold">₦{preset.amount}</div>
                  <div className="text-xs text-success">+₦{preset.cashback} cashback</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Amount Input */}
          <div>
            <label className="block text-base text-secondary mb-2">Custom Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₦ 50-500,000"
              className="input-field"
              min="50"
              max="500000"
            />
          </div>

          {amount && (
            <div className="text-sm text-secondary">
              Cost: ~{hbarCost} APT
            </div>
          )}

          <Button 
            disabled={!phoneNumber || !selectedNetwork || !amount || isLoading} 
            isLoading={isLoading}
          >
            Pay
          </Button>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        title="Confirm Airtime Purchase"
        description={`You are sending ₦${amount} ${selectedNetwork?.name || ''} Airtime to ${phoneNumber}.`}
        amount={amount}
        recipient={phoneNumber}
        transactionType="airtime"
        isLoading={isLoading}
      />
    </>
  );
}