import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'লোড হচ্ছে...' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`} />
      {text && <p className="mt-3 text-gray-500 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
