'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getLatestNewsVideos } from '@/lib/youtube';
import { useEffect, useState } from 'react';
import type { YouTubeVideo } from '@/types';
import { VideoCard } from '@/components/news/video-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function VideosPage() {
  useRequireAuth();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      const fetchedVideos = await getLatestNewsVideos();
      setVideos(fetchedVideos);
      setIsLoading(false);
    };
    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-headline">Latest News Videos</h1>
       {isLoading ? (
         <div className="flex h-full items-center justify-center pt-20">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-12">
            <p>Could not load videos at this time.</p>
            <p>This may be due to a missing or invalid YouTube API key.</p>
        </div>
      )}
    </div>
  );
}
