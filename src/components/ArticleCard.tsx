'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/lib/database.types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [localArticle, setLocalArticle] = useState(article);
  const router = useRouter();

  // Poll for updates when title or tldr is missing
  useEffect(() => {
    // Don't poll if deleted
    if (isDeleted) return;
    
    // Stop polling if we have everything
    const hasTitle = !!localArticle.title;
    const hasTldr = !!localArticle.tldr;
    const hasError = !!localArticle.ai_error;
    
    if (hasTitle && (hasTldr || hasError)) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/articles/${localArticle.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.article) {
            setLocalArticle(data.article);
            // Stop if we have title AND (tldr OR error)
            if (data.article.title && (data.article.tldr || data.article.ai_error)) {
              clearInterval(pollInterval);
            }
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(pollInterval);
  }, [localArticle.id, localArticle.title, localArticle.tldr, localArticle.ai_error, isDeleted]);

  // Render nothing if deleted (using fragment to maintain hook consistency)
  if (isDeleted) {
    return null;
  }

  // Format the date
  const savedDate = new Date(localArticle.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Status badge colors
  const statusColors = {
    unread: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    read: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    starred: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${localArticle.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleted(true); // Hide immediately
        router.refresh(); // Also refresh for consistency
      } else {
        console.error('Failed to delete article');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/articles/${localArticle.id}`, {
        method: 'PATCH',
      });

      const data = await response.json();
      
      if (response.ok && data.article) {
        setLocalArticle(data.article);
      } else {
        // Update local state with new error
        setLocalArticle(prev => ({ ...prev, ai_error: data.error || 'Retry failed' }));
      }
    } catch (error) {
      console.error('Retry error:', error);
      setLocalArticle(prev => ({ ...prev, ai_error: 'Network error. Please try again.' }));
    } finally {
      setIsRetrying(false);
    }
  };

  // Check if gist needs truncation (more than ~300 chars for the longer format)
  const tldrNeedsTruncation = localArticle.tldr && localArticle.tldr.length > 300;

  return (
    <div className={`p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 
                    hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors
                    ${isDeleting ? 'opacity-50' : ''}`}>
      {/* Header: Title + Delete Button */}
      <div className="flex items-start justify-between gap-2">
        {localArticle.title ? (
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 flex-1">
            {localArticle.title}
          </h3>
        ) : (
          <div className="flex-1 space-y-1 animate-pulse">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
          </div>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Delete article"
        >
          {isDeleting ? (
            <span className="text-xs">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* AI Error with Retry */}
      {localArticle.ai_error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-between gap-2">
          <span className="text-xs text-red-600 dark:text-red-400">{localArticle.ai_error}</span>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            title="Retry AI analysis"
          >
            {isRetrying ? (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Shimmering Placeholder when AI is processing */}
      {!localArticle.tldr && !localArticle.ai_error && (
        <div className="mt-2 space-y-2 animate-pulse">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-4/5"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/5"></div>
        </div>
      )}

      {/* Gist */}
      {localArticle.tldr && !localArticle.ai_error && (
        <div className="mt-3">
          <div 
            className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-100 [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: (expanded || !tldrNeedsTruncation ? localArticle.tldr : localArticle.tldr?.slice(0, 300) + '...')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
            }}
          />
          {tldrNeedsTruncation && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-600 mt-1 font-medium"
            >
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      )}

      {/* Takeaways removed - gist replaces this */}

      {/* Categories */}
      {localArticle.categories && localArticle.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {localArticle.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 
                         text-zinc-600 dark:text-zinc-400"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Reading time, date, status */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          {localArticle.reading_time && (
            <span>{localArticle.reading_time} min read</span>
          )}
          <span>·</span>
          <span>Saved {savedDate}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[localArticle.status]}`}>
          {localArticle.status}
        </span>
      </div>

      {/* Link to original */}
      <a
        href={localArticle.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Read original →
      </a>
    </div>
  );
}
