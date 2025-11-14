'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isUserLoading, router, redirectTo]);

  return useUser();
};
