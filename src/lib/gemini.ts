// Google Gemini AI client for article analysis
// Using official @google/generative-ai SDK

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildInsightPrompt } from './insightPrompt';

export type ArticleType = 'argument' | 'explainer' | 'news' | 'case-study' | 'low-signal';
export type InsightDepth = 'compact' | 'standard' | 'deep' | 'low-signal';

const validArticleTypes: readonly ArticleType[] = ['argument', 'explainer', 'news', 'case-study', 'low-signal'];
const validInsightDepths: readonly InsightDepth[] = ['compact', 'standard', 'deep', 'low-signal'];

function isArticleType(value: unknown): value is ArticleType {
  return typeof value === 'string' && validArticleTypes.includes(value as ArticleType);
}

function isInsightDepth(value: unknown): value is InsightDepth {
  return typeof value === 'string' && validInsightDepths.includes(value as InsightDepth);
}

export interface ArticleAnalysis {
  analysis: string;
  articleType: ArticleType;
  insightDepth: InsightDepth;
  categories: string[];
  sourceBasis: string;
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

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite'
});

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze article content using Gemini AI
 * Generates: analysis gist and categories
 * Includes retry logic for rate limits
 */
export async function analyzeArticle(title: string, content: string): Promise<ArticleAnalysis> {
  // Truncate content if too long (Gemini has token limits)
  const truncatedContent = content.slice(0, 15000);
  const prompt = buildInsightPrompt(title, truncatedContent);

  try {
    // Retry logic for rate limits
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry: 2s, 4s
          await delay(2000 * attempt);
          console.log(`Gemini retry attempt ${attempt + 1}`);
        }
        
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
        
        const analysis = JSON.parse(cleanJson) as {
          analysis?: unknown;
          articleType?: unknown;
          insightDepth?: unknown;
          categories?: unknown;
          sourceBasis?: unknown;
        };

        if (typeof analysis.analysis !== 'string' || !analysis.analysis.trim()) {
          throw new Error('Invalid AI response: analysis is required');
        }
        if (!isArticleType(analysis.articleType)) {
          throw new Error('Invalid AI response: articleType is required');
        }
        if (!isInsightDepth(analysis.insightDepth)) {
          throw new Error('Invalid AI response: insightDepth is required');
        }
        if (typeof analysis.sourceBasis !== 'string' || !analysis.sourceBasis.trim()) {
          throw new Error('Invalid AI response: sourceBasis is required');
        }
        if (!Array.isArray(analysis.categories) || analysis.categories.length === 0) {
          throw new Error('Invalid AI response: categories must be a non-empty array');
        }

        const categories = analysis.categories
          .filter((category): category is string => typeof category === 'string')
          .map((category) => category.trim())
          .filter(Boolean);

        if (categories.length === 0) {
          throw new Error('Invalid AI response: categories must contain strings');
        }

        return {
          analysis: analysis.analysis.trim(),
          articleType: analysis.articleType,
          insightDepth: analysis.insightDepth,
          categories,
          sourceBasis: analysis.sourceBasis.trim(),
        };
      } catch (err: unknown) {
        lastError = err;
        const errMsg = (err as { message?: string }).message || '';
        // Only retry on rate limit or service unavailable
        if (!errMsg.includes('429') && !errMsg.includes('503') && !errMsg.includes('Too Many') && !errMsg.includes('high demand')) {
          throw err; // Don't retry other errors
        }
      }
    }
    throw lastError; // All retries failed
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
