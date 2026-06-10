import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractArticle } from '@/lib/jina';
import { analyzeArticle, GeminiError } from '@/lib/gemini';
import { analyzeWithGroq } from '@/lib/groq';

// Track in-progress processing to prevent duplicate work
const processingArticles = new Set<string>();

// GET /api/articles/[id] - Get a single article (triggers processing if needed)
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

    // Check if article needs processing (no title and no error yet)
    const needsProcessing = !article.title && !article.ai_error;
    
    // If needs processing and not already being processed, do it now
    if (needsProcessing && !processingArticles.has(id)) {
      processingArticles.add(id);
      
      try {
        console.log('Processing article:', id);
        
        // Step 1: Extract with Jina
        let title = null;
        let content = null;
        let readingTime = null;
        let extractionError: string | null = null;
        
        try {
          const extracted = await extractArticle(article.url);
          title = extracted.title || 'Untitled';
          content = extracted.content || '';
          readingTime = extracted.readingTime;
          console.log('Extraction done:', { title, contentLength: content?.length });
        } catch (e) {
          console.error('Jina extraction failed:', e);
          title = 'Could not extract title';
          extractionError = 'Could not extract article. The site may be blocked.';
        }
        
        // Update with extraction results
        await supabase
          .from('articles')
          .update({ title, content, reading_time: readingTime, ai_error: extractionError })
          .eq('id', id);
        
        article.title = title;
        article.content = content;
        article.reading_time = readingTime;
        article.ai_error = extractionError;
        
        // Step 2: AI analysis (if we have content)
        if (content && content.length > 100 && !extractionError) {
          try {
            // Try Gemini first, fall back to Groq if unavailable
            let analysis;
            try {
              analysis = await analyzeArticle(title!, content);
            } catch (geminiErr) {
              if (geminiErr instanceof GeminiError && (geminiErr.status === 429 || geminiErr.status === 503 || geminiErr.status === 404)) {
                console.log('Gemini unavailable, trying Groq...');
                analysis = await analyzeWithGroq(title!, content);
              } else {
                throw geminiErr;
              }
            }
            
            await supabase
              .from('articles')
              .update({
                analysis: analysis.analysis,
                categories: analysis.categories,
              })
              .eq('id', id);
            
            article.analysis = analysis.analysis;
            article.categories = analysis.categories;
            console.log('AI analysis done for:', id);
          } catch (aiError) {
            console.error('AI analysis failed:', aiError);
            let errorMessage = 'AI analysis failed. Click retry.';
            if (aiError instanceof GeminiError && aiError.status === 429) {
              errorMessage = 'Rate limit. Retry in 1 minute.';
            }
            await supabase.from('articles').update({ ai_error: errorMessage }).eq('id', id);
            article.ai_error = errorMessage;
          }
        }
      } finally {
        processingArticles.delete(id);
      }
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
      // Try Gemini first, fall back to Groq if unavailable
      let analysis;
      try {
        analysis = await analyzeArticle(article.title || 'Untitled', article.content);
      } catch (geminiErr) {
        if (geminiErr instanceof GeminiError && (geminiErr.status === 429 || geminiErr.status === 503 || geminiErr.status === 404)) {
          console.log('Gemini unavailable on retry, trying Groq...');
          analysis = await analyzeWithGroq(article.title || 'Untitled', article.content);
        } else {
          throw geminiErr;
        }
      }
      
      // Update article with AI results
      const { data: updated, error: updateError } = await supabase
        .from('articles')
        .update({
          analysis: analysis.analysis,
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
