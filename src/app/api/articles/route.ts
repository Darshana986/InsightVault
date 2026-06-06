import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractArticle } from '@/lib/jina';
import { analyzeArticle, GeminiError } from '@/lib/gemini';

// Background processing: Jina extraction + AI analysis
async function processInBackground(articleId: string, url: string) {
  let title = 'Could not extract title';
  let content = '';
  let readingTime = null;

  // Step 1: Extract with Jina
  try {
    const extracted = await extractArticle(url);
    title = extracted.title;
    content = extracted.content;
    readingTime = extracted.readingTime;
    
    // Update article with extracted content
    await supabase
      .from('articles')
      .update({
        title,
        content,
        reading_time: readingTime,
      })
      .eq('id', articleId);
      
    console.log('Jina extraction completed for article:', articleId);
  } catch (extractError) {
    console.error('Jina extraction failed:', extractError);
    await supabase
      .from('articles')
      .update({ title: 'Could not extract title' })
      .eq('id', articleId);
    return; // Can't do AI without content
  }

  // Step 2: AI Analysis
  if (content && content.length > 100) {
    try {
      const analysis = await analyzeArticle(title, content);
      
      await supabase
        .from('articles')
        .update({
          tldr: analysis.tldr,
          takeaways: analysis.takeaways,
          categories: analysis.categories,
          ai_error: null,
        })
        .eq('id', articleId);
        
      console.log('AI analysis completed for article:', articleId);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      
      let errorMessage = 'AI analysis failed. Click retry to try again.';
      if (aiError instanceof GeminiError) {
        if (aiError.status === 429) {
          errorMessage = 'Rate limit reached. Please retry in 1 minute.';
        } else if (aiError.status === 404) {
          errorMessage = 'AI service unavailable. Please retry later.';
        }
      }
      
      await supabase
        .from('articles')
        .update({ ai_error: errorMessage })
        .eq('id', articleId);
    }
  }
}

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

    // Step 1: Save to database IMMEDIATELY with just the URL
    const { data: savedArticle, error: saveError } = await supabase
      .from('articles')
      .insert({
        url,
        title: null, // Will be filled by background process
        content: null,
        reading_time: null,
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
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

    // Step 2: Schedule Jina + AI processing in background (non-blocking)
    after(() => processInBackground(savedArticle.id, url));

    // Return immediately - card appears instantly
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
