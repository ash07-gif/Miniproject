'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AiSummary from '@/components/news/ai-summary';
import { addToReadingHistory } from '@/lib/firestore';

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

    useEffect(() => {
        if (params.slug) {
            const decodedUrl = decodeURIComponent(Array.isArray(params.slug) ? params.slug.join('/') : params.slug);
            setUrl(decodedUrl);
            
            if(user) {
              const articleData = {
                url: decodedUrl,
                title: 'Article', // We don't have full article data here
                description: null,
                urlToImage: null,
                publishedAt: new Date().toISOString(),
                source: { id: null, name: 'Unknown' },
              };
              // This is a fire-and-forget operation
              addToReadingHistory(user.uid, articleData);
            }
        }
    }, [params.slug, user]);

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sticky top-0 z-10">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-muted-foreground">{url}</p>
                </div>
                <Button size="sm" onClick={() => setIsAiSummaryOpen(true)}>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Summarize with AI
                </Button>
            </header>
            <div className="flex-1 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background">
                        <LoadingSpinner className="h-8 w-8" />
                    </div>
                )}
                {url && (
                    <iframe
                        src={url}
                        className={`h-full w-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
                        onLoad={() => setIsLoading(false)}
                        title="Article"
                        sandbox="allow-scripts allow-same-origin"
                    />
                )}
            </div>
            {url && (
              <AiSummary 
                articleUrl={url} 
                isOpen={isAiSummaryOpen} 
                setIsOpen={setIsAiSummaryOpen} 
              />
            )}
        </div>
    );
}

