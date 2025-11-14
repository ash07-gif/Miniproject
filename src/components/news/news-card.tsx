'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { Globe } from 'lucide-react';

export function NewsCard({ article }: { article: Article }) {
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'fallback-news');
  const encodedUrl = encodeURIComponent(article.url);
  
  const timeAgo = article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : '';

  return (
    <Link href={`/article/${encodedUrl}`} className="group block">
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
            {article.title}
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
    </Link>
  );
}
