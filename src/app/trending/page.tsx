'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getTrendingNews } from '@/lib/news';
import { useEffect, useState } from 'react';
import type { Article } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function TrendingPage() {
  useRequireAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      const newsArticles = await getTrendingNews();
      setArticles(newsArticles);
      setIsLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-headline">Trending News</h1>
       {isLoading ? (
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
            <p>Could not load trending articles at this time.</p>
        </div>
      )}
    </div>
  );
}
