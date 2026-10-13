import type { Post } from '../types';
import type { IntelligenceBriefing } from './briefingEngine';

export interface ServerBriefingPostPayload {
  id: string;
  title: string;
  summary?: string;
  sourceName?: string;
  category?: string;
  publishedAt?: string;
  originalUrl?: string;
}

/**
 * Request server-side Gemini intelligence briefing via Vercel serverless function (/api/briefing).
 * Returns null if serverless endpoint is unavailable (e.g., in local static preview or if no API key is configured on server),
 * allowing graceful fallback to deterministic editorial synthesis.
 */
export async function fetchServerBriefing(
  posts: Post[]
): Promise<IntelligenceBriefing[] | null> {
  if (!posts || posts.length === 0) return null;

  try {
    const payload: ServerBriefingPostPayload[] = posts.slice(0, 25).map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      sourceName: p.sourceName,
      category: p.category,
      publishedAt: p.publishedAt,
      originalUrl: p.originalUrl,
    }));

    const response = await fetch('/api/briefing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts: payload }),
    });

    if (!response.ok) {
      console.warn(`Server briefing returned status ${response.status}: falling back to editorial synthesis`);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data as IntelligenceBriefing[];
    }

    return null;
  } catch (err) {
    // Network failure, offline mode, or static dev server without backend API
    console.warn('Unable to reach /api/briefing serverless function; using offline editorial synthesis:', err);
    return null;
  }
}
