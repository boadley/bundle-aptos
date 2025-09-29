

interface Transaction {
  id: string;
  type: 'airtime' | 'bank' | 'bills';
  description: string;
  recipient: string;
  amount: string;
  timestamp: string;
}

// Mock data for recent transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'airtime',
    description: 'Airtime Purchase',
    recipient: '08012345678',
    amount: '-₦1,000',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    type: 'bank',
    description: 'Bank Transfer',
    recipient: "Mama J's Kitchen",
    amount: '-₦12,500',
    timestamp: '1 day ago'
  },
  {
    id: '3',
    type: 'airtime',
    description: 'Airtime Purchase',
    recipient: '07098765432',
    amount: '-₦500',
    timestamp: '3 days ago'
  }
];

function TransactionIcon({ type }: { type: Transaction['type'] }) {
  switch (type) {
    case 'airtime':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case 'bank':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
}

export default function RecentTransactions() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
      <div className="card">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
                <TransactionIcon type={transaction.type} />
              </div>
              <div>
                <div className="text-base text-white">{transaction.description}</div>
                <div className="text-sm text-secondary">{transaction.recipient}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base text-white">{transaction.amount}</div>
              <div className="text-sm text-secondary">{transaction.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}