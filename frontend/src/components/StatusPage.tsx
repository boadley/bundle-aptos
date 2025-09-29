
import { useNavigate, useLocation } from 'react-router-dom';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoArrowBackOutline, IoReceiptOutline, IoShareOutline } from 'react-icons/io5';
import Button from './Button';

interface StatusPageProps {
  status: 'success' | 'failed';
  transactionType: 'airtime' | 'bank';
  amount: string;
  recipient: string;
  transactionId?: string;
  errorMessage?: string;
}

export default function StatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as StatusPageProps;

  if (!state) {
    // Redirect to home if no state is provided
    navigate('/');
    return null;
  }

  const { status, transactionType, amount, recipient, transactionId, errorMessage } = state;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleViewReceipt = () => {
    // TODO: Implement receipt view
    console.log('View receipt for transaction:', transactionId);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Bundle Transaction',
        text: `Successfully sent ₦${amount} ${transactionType === 'airtime' ? 'airtime' : 'bank transfer'} to ${recipient}`,
        url: window.location.href,
      });
    }
  };

  const isSuccess = status === 'success';
  const transactionTypeLabel = transactionType === 'airtime' ? 'Airtime Purchase' : 'Bank Transfer';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-disabled/20">
        <button
          onClick={handleGoHome}
          className="flex items-center text-secondary hover:text-white transition-colors"
        >
          <IoArrowBackOutline className="w-6 h-6 mr-2" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Status Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          {/* Status Icon */}
          <div className="mb-8">
            {isSuccess ? (
              <div className="w-24 h-24 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
                <IoCheckmarkCircleOutline className="w-12 h-12 text-success" />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto bg-error/20 rounded-full flex items-center justify-center mb-4">
                <IoCloseCircleOutline className="w-12 h-12 text-error" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="mb-8">
            <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-success' : 'text-error'}`}>
              {isSuccess ? 'Transaction Successful!' : 'Transaction Failed'}
            </h1>
            <p className="text-secondary text-base mb-4">
              {isSuccess 
                ? `Your ${transactionTypeLabel.toLowerCase()} has been processed successfully.`
                : `Your ${transactionTypeLabel.toLowerCase()} could not be completed.`
              }
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-surface rounded-xl p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Type</span>
                <span className="text-white font-medium">{transactionTypeLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Amount</span>
                <span className="text-white font-bold">₦{amount}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-secondary">Recipient</span>
                <span className="text-white font-medium text-right max-w-[200px] break-words">
                  {recipient}
                </span>
              </div>
              {transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Transaction ID</span>
                  <span className="text-white font-mono text-sm">{transactionId.slice(0, 4)}....{transactionId.slice(-4)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-secondary">Status</span>
                <span className={`font-bold ${isSuccess ? 'text-success' : 'text-error'}`}>
                  {isSuccess ? 'Completed' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Date</span>
                <span className="text-white">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {!isSuccess && errorMessage && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-8">
              <p className="text-error text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess ? (
              <>
                <div className="flex gap-3">
                  <button
                    onClick={handleViewReceipt}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-accent text-accent rounded-xl font-bold hover:bg-accent/10 transition-colors"
                  >
                    <IoReceiptOutline className="w-5 h-5 mr-2" />
                    View Receipt
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-accent text-accent rounded-xl font-bold hover:bg-accent/10 transition-colors"
                  >
                    <IoShareOutline className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
                <Button onClick={handleGoHome}>
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleTryAgain}>
                  Try Again
                </Button>
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 px-4 border border-disabled text-secondary rounded-xl font-bold hover:border-accent/50 hover:text-white transition-colors"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}