// Jina Reader API client for article extraction
// Docs: https://jina.ai/reader/

export interface ExtractedArticle {
  title: string;
  content: string;
  description?: string;
  readingTime: number; // in minutes
}

const JINA_API_KEY = process.env.JINA_API_KEY;

function computeReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html: string, name: string): string | null {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(pattern);
  return match?.[1]?.trim() || null;
}

function parseTitle(html: string): string {
  const ogTitle = extractMeta(html, 'og:title');
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || 'Untitled';
}

function isJinaBlocked(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|451|403|408|500|502|503|504)\b/.test(message)
    || /rate limit|temporar|blocked|forbidden|timeout|unavailable|cloudflare/i.test(message);
}

async function extractWithJina(url: string): Promise<ExtractedArticle> {
  const jinaUrl = `https://r.jina.ai/${url}`;

  console.log('Calling Jina API:', jinaUrl);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (JINA_API_KEY) {
    headers.Authorization = `Bearer ${JINA_API_KEY}`;
  }

  const response = await fetch(jinaUrl, { headers });

  console.log('Jina response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Jina error response:', errorText);
    throw new Error(`Jina Reader failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Jina response data keys:', Object.keys(data));
  console.log('Jina data.data:', data.data ? Object.keys(data.data) : 'no data.data');

  const content = data.data?.content || '';
  return {
    title: data.data?.title || 'Untitled',
    content,
    description: data.data?.description,
    readingTime: computeReadingTime(content),
  };
}

async function extractDirectly(url: string): Promise<ExtractedArticle> {
  console.log('Falling back to direct extraction:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Direct extraction failed: ${response.status}`);
  }

  const html = await response.text();
  const title = parseTitle(html);
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || undefined;
  const content = stripHtml(html);

  return {
    title,
    content,
    description,
    readingTime: computeReadingTime(content),
  };
}

/**
 * Extract article content using Jina Reader API (free tier)
 * Falls back to direct HTML extraction when Jina is unavailable.
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  try {
    return await extractWithJina(url);
  } catch (error) {
    if (isJinaBlocked(error)) {
      return await extractDirectly(url);
    }
    throw error;
  }
}
