'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

// ponytail: visible error indicator when a fetch fails — seed data fallback stays, but no silent mask
export const FetchErrorBanner: React.FC<{ message?: string }> = ({
  message = 'Failed to load data from the server. Temporary data is being shown.',
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
