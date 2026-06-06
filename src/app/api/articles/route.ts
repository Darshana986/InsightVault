import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractArticle } from '@/lib/jina';
import { analyzeArticle, GeminiError } from '@/lib/gemini';

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
      title = 'Could not extract title';
    }

    // Step 2: Save to database with extracted content
    const { data: savedArticle, error: saveError } = await supabase
      .from('articles')
      .insert({
        url,
        title,
        content,
        reading_time: readingTime,
        status: 'unread',
        tldr: null,
        takeaways: null,
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

    // Step 3: Try AI analysis (don't block on failure)
    if (content && content.length > 100) {
      try {
        const analysis = await analyzeArticle(title, content);
        
        await supabase
          .from('articles')
          .update({
            tldr: analysis.tldr,
            takeaways: analysis.takeaways,
            categories: analysis.categories,
          })
          .eq('id', savedArticle.id);
        
        savedArticle.tldr = analysis.tldr;
        savedArticle.takeaways = analysis.takeaways;
        savedArticle.categories = analysis.categories;
        
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        
        let errorMessage = 'AI analysis failed. Click retry to try again.';
        if (aiError instanceof GeminiError) {
          if (aiError.status === 429) {
            errorMessage = 'Rate limit reached. Please retry in 1 minute.';
          }
        }
        
        await supabase
          .from('articles')
          .update({ ai_error: errorMessage })
          .eq('id', savedArticle.id);
        
        savedArticle.ai_error = errorMessage;
      }
    }

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
