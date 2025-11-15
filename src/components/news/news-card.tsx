'use client';

import Image from 'next/image';
import type { Article } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { Globe, ArrowRight } from 'lucide-react';
import { useUser } from '@/firebase';
import { addToReadingHistory } from '@/lib/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NewsCard({ article }: { article: Article }) {
  const { user } = useUser();
  const router = useRouter();
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'fallback-news');
  
  const timeAgo = article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : '';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (user) {
      // This is a fire-and-forget operation
      addToReadingHistory(user.uid, article);
    }
    const articleUrl = `/article/${encodeURIComponent(article.url)}`;
    router.push(articleUrl);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={article.urlToImage || fallbackImage?.imageUrl || ''}
            alt={article.title}
            data-ai-hint="news article"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-base font-bold font-headline leading-snug line-clamp-3">
          <a href={`/article/${encodeURIComponent(article.url)}`} onClick={handleClick} className="hover:underline">
            {article.title}
          </a>
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center gap-2 truncate">
          <Globe className="h-3 w-3" />
          <span className="truncate">{article.source.name}</span>
        </div>
        <span className="flex-shrink-0">{timeAgo}</span>
      </CardFooter>
    </Card>
  );
}
