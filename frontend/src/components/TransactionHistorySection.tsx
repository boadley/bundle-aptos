import { IoPhonePortraitOutline, IoGiftOutline, IoCheckmarkCircle, IoBusiness } from 'react-icons/io5';

interface Transaction {
  id: string;
  type: 'airtime' | 'bonus' | 'transfer';
  title: string;
  subtitle: string;
  amount: string;
  status: 'successful' | 'pending' | 'failed';
  date: string;
  time: string;
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'bonus',
    title: 'Bonus from Airtime Purchase',
    subtitle: 'Cashback reward',
    amount: '+₦50',
    status: 'successful',
    date: 'Today',
    time: '2:30 PM'
  },
  {
    id: '2',
    type: 'airtime',
    title: 'Airtime',
    subtitle: '08012345678',
    amount: '-₦1,000',
    status: 'successful',
    date: 'Today',
    time: '2:25 PM'
  },
  {
    id: '3',
    type: 'transfer',
    title: 'Bank Transfer',
    subtitle: 'GTBank - John Doe',
    amount: '-₦5,000',
    status: 'successful',
    date: 'Yesterday',
    time: '4:15 PM'
  }
];

function TransactionIcon({ type }: { type: Transaction['type'] }) {
  switch (type) {
    case 'airtime':
      return <IoPhonePortraitOutline className="w-5 h-5 text-accent" />;
    case 'bonus':
      return <IoGiftOutline className="w-5 h-5 text-success" />;
    case 'transfer':
      return <IoBusiness className="w-5 h-5 text-accent" />;
    default:
      return <IoPhonePortraitOutline className="w-5 h-5 text-accent" />;
  }
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
          <TransactionIcon type={transaction.type} />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{transaction.title}</p>
          <p className="text-secondary text-xs">{transaction.subtitle}</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <div className="w-20 text-right">
            <span className={`text-sm font-medium ${
              transaction.amount.startsWith('+') ? 'text-success' : 'text-white'
            }`}>
              {transaction.amount}
            </span>
          </div>
          {transaction.status === 'successful' && (
            <IoCheckmarkCircle className="w-4 h-4 text-success" />
          )}
        </div>
        <p className="text-secondary text-xs">{transaction.date} • {transaction.time}</p>
        <p className="text-success text-xs capitalize">{transaction.status}</p>
      </div>
    </div>
  );
}

export default function TransactionHistorySection() {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-lg">Transaction History</h3>
        <button className="text-accent text-sm font-medium">See All</button>
      </div>
      
      <div className="bg-surface rounded-2xl p-4">
        {mockTransactions.map((transaction, index) => (
          <div key={transaction.id}>
            <TransactionItem transaction={transaction} />
            {index < mockTransactions.length - 1 && (
              <div className="border-b border-disabled/20 my-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}