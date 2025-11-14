'use server';
import type { Article } from '@/types';
import { NEWS_API_SOURCES } from './constants';

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

async function fetchNews(endpoint: string, params: Record<string, string>): Promise<Article[]> {
  if (!API_KEY) {
    console.error('News API key is missing.');
    return [];
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': API_KEY,
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`News API error: ${response.status} ${response.statusText}`, errorData.message);
      return [];
    }

    const data = await response.json();
    return data.articles
      .filter((article: any) => article.title && article.title !== '[Removed]' && article.urlToImage)
      .map((article: any): Article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source.id,
          name: article.source.name,
        },
      }));
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
}

export async function getTopHeadlines(country: string = 'in'): Promise<Article[]> {
  return fetchNews('top-headlines', { country, pageSize: '20' });
}

export async function getTrendingNews(): Promise<Article[]> {
    return fetchNews('top-headlines', { 
        sources: NEWS_API_SOURCES, 
        pageSize: '20' 
    });
}

export async function searchNews(query: string): Promise<Article[]> {
  if (!query) return [];
  return fetchNews('everything', { q: query, language: 'en', sortBy: 'relevancy', pageSize: '20' });
}

export async function getNewsForCategories(categories: string[]): Promise<Article[]> {
  if (!categories || categories.length === 0) {
    return getTopHeadlines();
  }
  
  // NewsAPI doesn't support multiple categories in one request for top-headlines.
  // We'll fetch for the first category. For a more advanced app, we could make multiple requests and merge.
  return fetchNews('top-headlines', { category: categories[0], country: 'in', pageSize: '20' });
}
