// Groq AI client - fallback for article analysis
// Using Llama 3.1 8B which has generous free tier (14.4K requests/day)

import Groq from 'groq-sdk';
import { ArticleAnalysis } from './gemini';

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

  // Truncate content if too long
  const truncatedContent = content.slice(0, 12000);

  const prompt = `You're summarizing this article for someone who saves articles but never reads them. Give them the gist so they don't have to.

ARTICLE TITLE: ${title}

ARTICLE CONTENT:
${truncatedContent}

---

Respond in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "analysis": "The full gist goes here - see rules below",
  "categories": ["Category1", "Category2"]
}

RULES FOR THE GIST:
- Write 10-15 lines total based on article size
- Keep paragraphs short (1-2 sentences) with blank lines between paragraphs
- Start with the main point in bold (use **text** for bold)
- Be conversational, like you're telling a friend
- Include the key facts, numbers, and context that matter
- No fluff, no jargon, no "this article discusses" or "the author argues"
- If there's interesting fine print or implications, include them
- End with any surprising or notable details
- Use line breaks between paragraphs (use \\n\\n)

RULES FOR CATEGORIES:
- Pick 1-3 from: AI, Product, Engineering, Business, Startups, Leadership, Marketing, Design, Career, Technology, Science, Culture, Other
- Return ONLY valid JSON, nothing else`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
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
    const analysis = JSON.parse(cleanJson);

    return {
      analysis: analysis.analysis || analysis.tldr || 'No summary available',
      categories: Array.isArray(analysis.categories) ? analysis.categories : [],
    };
  } catch (error: unknown) {
    console.error('Groq analysis error:', error);
    const errorObj = error as { status?: number; message?: string };
    throw new Error(errorObj.message || 'Groq analysis failed');
  }
}
