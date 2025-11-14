'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The FirebaseProvider now internally handles initialization.
  // We just need to render it.
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
