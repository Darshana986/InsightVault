import { Article } from '@/lib/database.types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Format the date
  const savedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Status badge colors
  const statusColors = {
    unread: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    read: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    starred: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 
                    hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      {/* Title */}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
        {article.title || 'Untitled Article'}
      </h3>

      {/* TLDR */}
      {article.tldr && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {article.tldr}
        </p>
      )}

      {/* Categories */}
      {article.categories && article.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {article.categories.slice(0, 3).map((category) => (
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
          {article.reading_time && (
            <span>{article.reading_time} min read</span>
          )}
          <span>·</span>
          <span>Saved {savedDate}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[article.status]}`}>
          {article.status}
        </span>
      </div>

      {/* Link to original */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Read original →
      </a>
    </div>
  );
}
