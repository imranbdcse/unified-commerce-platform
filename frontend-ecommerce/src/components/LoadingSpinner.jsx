import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex justify-center items-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-red-200 border-t-red-600`} />
    </div>
  );
};

export default LoadingSpinner;
