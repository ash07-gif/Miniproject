export interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  readAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  preferences: string[];
  age?: number;
}


export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
}
