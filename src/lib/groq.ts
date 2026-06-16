// Groq AI client - fallback for article analysis
// Using Llama 3.1 8B which has generous free tier (14.4K requests/day)

import Groq from 'groq-sdk';
import { ArticleAnalysis } from './gemini';
import { buildInsightPrompt } from './insightPrompt';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Analyze article content using Groq (Llama 3.1 8B)
 * Used as fallback when Gemini is rate limited
 */
export async function analyzeWithGroq(title: string, content: string): Promise<ArticleAnalysis> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  // Keep payload compact for Groq free-tier token limits.
  // The new prompt template is longer, so we reduce content budget further.
  const truncatedContent = content.slice(0, 3000);
  const prompt = buildInsightPrompt(title, truncatedContent);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 512, // JSON output is tiny; prevents hitting token budget mid-generation
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const textResponse = completion.choices[0]?.message?.content;

    if (!textResponse) {
      throw new Error('No response from Groq');
    }

    console.log('Groq raw response (first 500 chars):', textResponse.slice(0, 500));

    // Clean up the response - remove markdown code blocks if present
    let cleanJson = textResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to extract JSON object if wrapped in other text
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    // Parse directly - JSON.parse handles newlines in valid JSON
    const analysis = JSON.parse(cleanJson) as {
      coreInsight?: unknown;
      evidence?: unknown;
      categories?: unknown;
    };

    if (typeof analysis.coreInsight !== 'string' || !analysis.coreInsight.trim()) {
      throw new Error('Invalid AI response: coreInsight is required');
    }
    if (typeof analysis.evidence !== 'string' || !analysis.evidence.trim()) {
      throw new Error('Invalid AI response: evidence is required');
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
      coreInsight: analysis.coreInsight.trim(),
      evidence: analysis.evidence.trim(),
      categories,
    };
  } catch (error: unknown) {
    console.error('Groq analysis error:', error);
    const errorObj = error as { status?: number; message?: string };
    throw new Error(errorObj.message || 'Groq analysis failed');
  }
}
