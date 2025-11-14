'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import type { Article } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function HistoryPage() {
  const { user } = useRequireAuth();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/readingHistory`),
      orderBy('readAt', 'desc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: articles, isLoading } = useCollection<Article>(historyQuery);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-headline">Reading History</h1>
      {isLoading ? (
        <div className="flex h-full items-center justify-center pt-20">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.url} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-12">
          <p>You haven't read any articles yet.</p>
          <p>Start browsing to build your history.</p>
        </div>
      )}
    </div>
  );
}
