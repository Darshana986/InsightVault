import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeArticle, GeminiError } from '@/lib/gemini';

// GET /api/articles/[id] - Get a single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[id] - Retry AI analysis
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch the article to get title and content
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (!article.content || article.content.length < 100) {
      return NextResponse.json(
        { error: 'Article content too short for analysis' },
        { status: 400 }
      );
    }

    try {
      const analysis = await analyzeArticle(article.title || 'Untitled', article.content);
      
      // Update article with AI results
      const { data: updated, error: updateError } = await supabase
        .from('articles')
        .update({
          tldr: analysis.tldr,
          takeaways: analysis.takeaways,
          categories: analysis.categories,
          ai_error: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ article: updated });
      
    } catch (aiError) {
      console.error('AI retry failed:', aiError);
      
      let errorMessage = 'AI analysis failed. Click retry to try again.';
      if (aiError instanceof GeminiError) {
        if (aiError.status === 429) {
          errorMessage = 'Rate limit reached. Please retry in 1 minute.';
        } else if (aiError.status === 404) {
          errorMessage = 'AI service unavailable. Please retry later.';
        }
      }
      
      // Update error in database
      await supabase
        .from('articles')
        .update({ ai_error: errorMessage })
        .eq('id', id);

      return NextResponse.json(
        { error: errorMessage },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
