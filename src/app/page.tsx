import { supabase } from '@/lib/supabase';
import { SaveArticleForm } from '@/components/SaveArticleForm';
import { ArticleList } from '@/components/ArticleList';

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch articles from database (Server Component - runs on server)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            InsightVault
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Turn articles into insights, not bookmarks.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Save Article Form */}
        <SaveArticleForm />

        {/* Connection Status (for debugging) */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            Database error: {error.message}
          </div>
        )}

        {/* Articles List */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Your Library ({articles?.length ?? 0} articles)
          </h2>
          <ArticleList initialArticles={articles ?? []} />
        </div>
      </main>
    </div>
  );
}
