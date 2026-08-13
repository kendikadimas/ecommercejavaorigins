'use client';

import React from 'react';
import { PageSpinner } from '@/components/PageSpinner';

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] bg-[#FAF8F5] flex items-center justify-center">
      <PageSpinner />
    </div>
  );
}
