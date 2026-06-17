'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleListItem } from '@/lib/database.types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  initialArticles: ArticleListItem[];
}

export function ArticleList({ initialArticles }: ArticleListProps) {
  const [articles, setArticles] = useState<ArticleListItem[]>(initialArticles);

  // Fetch articles from parent endpoint and kick processing for one pending item.
  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        const nextArticles: ArticleListItem[] = data.articles || [];
        setArticles(nextArticles);

        const pendingArticle = nextArticles.find(
          (a) => !a.title && !a.ai_error && !a.processing_started_at
        );

        if (pendingArticle) {
          // Trigger server-side processing for one article to avoid card-level fan-out.
          void fetch(`/api/articles/${pendingArticle.id}`, { cache: 'no-store' });
        }
      }
    } catch (e) {
      console.error('Parent poll error:', e);
    }
  }, []);

  // Poll every 5 seconds for updates
  useEffect(() => {
    // Initial fetch
    fetchArticles();

    // Set up polling interval
    const pollInterval = setInterval(fetchArticles, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchArticles]);

  // Handle when articles are deleted (optimistic update)
  const handleArticleDeleted = useCallback((articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
  }, []);

  // Handle when retry is clicked (refresh articles)
  const handleRetry = useCallback(() => {
    // Refresh immediately after retry
    setTimeout(fetchArticles, 500);
  }, [fetchArticles]);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <p className="text-lg">No articles saved yet.</p>
        <p className="mt-2">Paste a URL above to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onDeleted={handleArticleDeleted}
          onRetry={handleRetry}
        />
      ))}
    </div>
  );
}
