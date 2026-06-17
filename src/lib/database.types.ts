// Database types for InsightVault
// These match the Supabase table schema

export type ArticleStatus = 'unread' | 'read' | 'starred';

export interface Article {
  id: string;
  url: string;
  title: string | null;
  content: string | null;
  analysis: string | null;
  categories: string[] | null;
  reading_time: number | null;
  status: ArticleStatus;
  user_notes: string | null;
  ai_error: string | null;
  processing_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ArticleListItem = Pick<
  Article,
  | 'id'
  | 'url'
  | 'title'
  | 'analysis'
  | 'categories'
  | 'reading_time'
  | 'status'
  | 'created_at'
  | 'ai_error'
  | 'processing_started_at'
>;

// For inserting new articles (id, created_at, updated_at are auto-generated)
export type NewArticle = Omit<Article, 'id' | 'created_at' | 'updated_at'>;

// Supabase database type definition
export interface Database {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Partial<Article> & { url: string };
        Update: Partial<Article>;
      };
    };
  };
}
