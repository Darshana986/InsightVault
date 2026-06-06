// Jina Reader API client for article extraction
// Docs: https://jina.ai/reader/

export interface ExtractedArticle {
  title: string;
  content: string;
  description?: string;
  readingTime: number; // in minutes
}

/**
 * Extract article content using Jina Reader API (free tier)
 * Simply prepend https://r.jina.ai/ to any URL
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  
  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Jina Reader failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Calculate reading time (average 200 words per minute)
  const wordCount = data.data?.content?.split(/\s+/).length ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    title: data.data?.title || 'Untitled',
    content: data.data?.content || '',
    description: data.data?.description,
    readingTime,
  };
}
