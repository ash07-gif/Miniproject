'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getNewsForCategories, getTopHeadlines } from '@/lib/news';
import { useEffect, useState } from 'react';
import type { Article, UserProfile } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const { user } = useRequireAuth();
  const firestore = useFirestore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile && !isLoadingProfile && selectedCategory === 'all') {
        const firstPreference = userProfile.preferences?.[0];
        if (firstPreference) {
            setSelectedCategory(firstPreference);
        } else {
            setSelectedCategory('general');
        }
    }
  }, [userProfile, isLoadingProfile, selectedCategory]);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoadingNews(true);
      let newsArticles: Article[] = [];
      
      if (selectedCategory && selectedCategory !== 'all') {
        newsArticles = await getNewsForCategories([selectedCategory]);
      } else if (userProfile?.preferences && userProfile.preferences.length > 0) {
        // When 'all' is selected, use all preferences
        newsArticles = await getNewsForCategories(userProfile.preferences);
      } else {
        // Fallback for users without preferences or when 'all' is selected without preferences
        newsArticles = await getTopHeadlines();
      }
      
      setArticles(newsArticles);
      setIsLoadingNews(false);
    };

    if (!isLoadingProfile) {
        fetchNews();
    }
  }, [selectedCategory, userProfile, isLoadingProfile]);

  if (isLoadingProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">For You</h1>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {userProfile?.preferences && userProfile.preferences.length > 1 && <SelectItem value="all">My Preferences</SelectItem>}
                        {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category} className="capitalize">
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
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
