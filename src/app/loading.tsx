'use client';

import React from 'react';
import { PageSpinner } from '@/components/PageSpinner';

export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-white flex items-center justify-center">
      <PageSpinner />
    </div>
  );
}
