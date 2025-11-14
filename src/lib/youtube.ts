'use server';
import type { YouTubeVideo } from '@/types';
import { YOUTUBE_CHANNELS } from './constants';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function getLatestNewsVideos(): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    console.error('YouTube API key is missing.');
    return [];
  }
  
  try {
    const videoPromises = YOUTUBE_CHANNELS.map(async (channel) => {
        const url = `${BASE_URL}/search?key=${API_KEY}&channelId=${channel.id}&part=snippet,id&order=date&maxResults=5`;
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
        if (!response.ok) {
            console.error(`YouTube API error for channel ${channel.name}: ${response.status}`);
            return [];
        }
        const data = await response.json();
        return data.items
          .filter((item: any) => item.id.kind === 'youtube#video')
          .map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnailUrl: item.snippet.thumbnails.high.url,
            }));
    });

    const results = await Promise.all(videoPromises);
    // Flatten and shuffle results to mix videos from different channels
    return results.flat().sort(() => Math.random() - 0.5);

  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error);
    return [];
  }
}
