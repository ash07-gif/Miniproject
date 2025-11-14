'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getNewsForCategories, getTopHeadlines, searchNews } from '@/lib/news';
import { useEffect, useState } from 'react';
import type { Article, UserProfile } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { user } = useRequireAuth();
  const firestore = useFirestore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [pageTitle, setPageTitle] = useState('Top Headlines');

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoadingNews(true);
      let newsArticles: Article[] = [];
      
      if (query) {
        setPageTitle(`Results for "${query}"`);
        newsArticles = await searchNews(query);
      } else if (selectedCategory === 'all') {
        if (userProfile?.preferences && userProfile.preferences.length > 0) {
            setPageTitle('For You');
            newsArticles = await getNewsForCategories(userProfile.preferences);
        } else {
            setPageTitle('Top Headlines');
            newsArticles = await getTopHeadlines();
        }
      } else {
        setPageTitle(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`);
        newsArticles = await getNewsForCategories([selectedCategory]);
      }
      
      setArticles(newsArticles);
      setIsLoadingNews(false);
    };

    fetchNews();
  }, [selectedCategory, userProfile, query]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      // If search is cleared, refetch based on current category
      setQuery('');
      return;
    }
    // The main useEffect will handle the search
  };


  if (isLoadingProfile && !userProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold font-headline">{pageTitle}</h1>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Select value={selectedCategory} onValueChange={(value) => {
                    setQuery(''); // Clear search when changing category
                    setSelectedCategory(value);
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                          {(userProfile?.preferences && userProfile.preferences.length > 0) ? 'My Preferences' : 'Top Headlines'}
                        </SelectItem>
                        {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category} className="capitalize">
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2 mb-8">
            <Input 
            type="text" 
            placeholder="Search for headlines..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoadingNews}>
                <Search className="h-4 w-4 mr-2" />
                Search
            </Button>
        </form>
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
            <p>No articles found.</p>
            <p>Try a different search or change your category preference.</p>
        </div>
      )}
    </div>
  );
}
