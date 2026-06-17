import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/articles - Save a new article (instant, processing happens via polling)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Just save URL to database - processing happens via GET polling
    const { data: savedArticle, error: saveError } = await supabase
      .from('articles')
      .insert({
        url,
        title: null,  // Will be filled by processing
        content: null,
        reading_time: null,
        status: 'unread',
        analysis: null,
        categories: null,
        ai_error: null,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Supabase error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save article: ' + saveError.message },
        { status: 500 }
      );
    }

    console.log('Article saved instantly:', savedArticle.id);
    return NextResponse.json({ article: savedArticle }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/articles - Get all articles
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, url, title, analysis, categories, reading_time, status, created_at, ai_error, processing_started_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ articles: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
