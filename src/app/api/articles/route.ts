import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractArticle } from '@/lib/jina';

// POST /api/articles - Save a new article
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

    // Step 1: Extract article content using Jina Reader
    let title = 'Untitled';
    let content = '';
    let readingTime = null;

    try {
      const extracted = await extractArticle(url);
      title = extracted.title;
      content = extracted.content;
      readingTime = extracted.readingTime;
    } catch (extractError) {
      console.error('Article extraction failed:', extractError);
      // Continue with basic save even if extraction fails
      title = 'Could not extract title';
    }

    // Step 2: Save to database
    const { data, error } = await supabase
      .from('articles')
      .insert({
        url,
        title,
        content,
        reading_time: readingTime,
        status: 'unread',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ article: data }, { status: 201 });
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
      .select('*')
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
