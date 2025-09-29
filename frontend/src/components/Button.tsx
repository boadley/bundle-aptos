import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  isLoading = false, 
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const baseClasses = "w-full flex items-center justify-center gap-2 transition-colors duration-200";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
}
