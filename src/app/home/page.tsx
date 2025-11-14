'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getNewsForCategories } from '@/lib/news';
import { useEffect, useState } from 'react';
import type { Article, UserProfile } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function HomePage() {
  const { user } = useRequireAuth();
  const firestore = useFirestore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile) {
      const fetchNews = async () => {
        setIsLoadingNews(true);
        const newsArticles = await getNewsForCategories(userProfile.preferences);
        setArticles(newsArticles);
        setIsLoadingNews(false);
      };
      fetchNews();
    }
  }, [userProfile]);

  if (isLoadingProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-headline">For You</h1>
      {isLoadingNews ? (
         <div className="flex h-full items-center justify-center pt-20">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.url} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-12">
            <p>No articles found for your preferences.</p>
            <p>Try updating your preferences in your profile.</p>
        </div>
      )}
    </div>
  );
}
