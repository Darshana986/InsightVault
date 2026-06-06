// Google Gemini AI client for article analysis
// Using official @google/generative-ai SDK

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ArticleAnalysis {
  tldr: string;
  takeaways: string[];
  categories: string[];
}

// Custom error class for Gemini errors
export class GeminiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Analyze article content using Gemini AI
 * Generates: TLDR, 3 key takeaways, and categories
 */
export async function analyzeArticle(title: string, content: string): Promise<ArticleAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Truncate content if too long (Gemini has token limits)
  const truncatedContent = content.slice(0, 15000);

  const prompt = `You're summarizing this article for someone who saves articles but never reads them. Give them the gist so they don't have to.

ARTICLE TITLE: ${title}

ARTICLE CONTENT:
${truncatedContent}

---

Respond in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "tldr": "The full gist goes here - see rules below",
  "takeaways": [],
  "categories": ["Category1", "Category2"]
}

RULES FOR THE GIST:
- Write 4-8 short paragraphs, each 1-2 sentences
- Start with the main point in bold (use **text** for bold)
- Be conversational, like you're telling a friend
- Include the key facts, numbers, and context that matter
- No fluff, no jargon, no "this article discusses" or "the author argues"
- If there's interesting fine print or implications, include them
- End with any surprising or notable details
- Use line breaks between paragraphs (use \\n\\n)

RULES FOR CATEGORIES:
- Pick 1-3 from: AI, Product, Engineering, Business, Startups, Leadership, Marketing, Design, Career, Technology, Science, Culture, Other
- Leave takeaways as empty array []
- Return ONLY valid JSON, nothing else`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    // Parse the JSON response
    // Clean up the response (remove any markdown code blocks if present)
    const cleanJson = textResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const analysis = JSON.parse(cleanJson);
    
    return {
      tldr: analysis.tldr || 'No summary available',
      takeaways: Array.isArray(analysis.takeaways) ? analysis.takeaways.slice(0, 3) : [],
      categories: Array.isArray(analysis.categories) ? analysis.categories : [],
    };
  } catch (error: unknown) {
    console.error('Gemini analysis error:', error);
    
    // Extract status code from Google AI SDK errors
    const errorObj = error as { status?: number; message?: string };
    const status = errorObj.status || 500;
    const message = errorObj.message || 'Unknown error';
    
    // Check for rate limit (429) or not found (404) in error message
    if (message.includes('429') || message.includes('Too Many Requests')) {
      throw new GeminiError('Rate limit reached', 429);
    }
    if (message.includes('404') || message.includes('Not Found')) {
      throw new GeminiError('Model not found', 404);
    }
    
    throw new GeminiError(message, status);
  }
}
