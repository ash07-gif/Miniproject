import Image from 'next/image';
import type { YouTubeVideo } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

export function VideoCard({ video }: { video: YouTubeVideo }) {
  return (
    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="group block">
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
                <div className="aspect-video relative">
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        data-ai-hint="video thumbnail"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Youtube className="h-12 w-12 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <CardTitle className="text-sm font-bold font-headline leading-snug line-clamp-2">
                    {video.title}
                </CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                <span>{video.channelTitle}</span>
            </CardFooter>
        </Card>
    </a>
  );
}
