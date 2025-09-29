

interface SuccessScreenProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function SuccessScreen({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message 
}: SuccessScreenProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col items-center justify-center p-4">
      {/* Large success checkmark */}
      <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-8">
        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Success title */}
      <h1 className="text-4xl font-bold text-white mb-4 text-center">
        {title}
      </h1>
      
      {/* Success message */}
      <p className="text-base text-white text-center mb-12 max-w-md">
        {message}
      </p>
      
      {/* Done button */}
      <div className="w-full max-w-sm">
        <button
          onClick={onClose}
          className="btn-primary"
        >
          Done
        </button>
      </div>
    </div>
  );
}