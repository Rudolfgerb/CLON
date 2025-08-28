import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  isDark?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '',
  isDark = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && (
        <p className={`mt-3 ${textSizeClasses[size]} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;