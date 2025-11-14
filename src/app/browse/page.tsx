'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { searchNews, getTopHeadlines } from '@/lib/news';
import { useEffect, useState } from 'react';
import type { Article } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function BrowsePage() {
  useRequireAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchInitialNews = async () => {
      setIsLoading(true);
      const newsArticles = await getTopHeadlines();
      setArticles(newsArticles);
      setIsLoading(false);
    };
    fetchInitialNews();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    const newsArticles = await searchNews(query);
    setArticles(newsArticles);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-headline">Browse News</h1>
      <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2 mb-8">
        <Input 
          type="text" 
          placeholder="Search for headlines..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
        </Button>
      </form>

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
          <p>No articles found for your search.</p>
        </div>
      )}
    </div>
  );
}
