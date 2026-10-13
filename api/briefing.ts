import { GoogleGenAI } from '@google/genai';

interface IncomingPostItem {
  id: string;
  title: string;
  summary?: string;
  sourceName?: string;
  category?: string;
  publishedAt?: string;
  originalUrl?: string;
}

interface IntelligenceBriefingResponse {
  id: string;
  generatedAt: string;
  topic: string;
  category: 'breaking' | 'sports' | 'social' | 'national';
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  primarySources: Array<{
    name: string;
    url: string;
  }>;
  socialDrafts: {
    whatsapp: string;
    facebook: string;
    xTwitter: string;
    telegram: string;
  };
  sourcePostIds: string[];
}

// In-memory rate limiting: max 10 requests per 60 seconds per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

export default async function handler(req: any, res?: any) {
  // Extract client IP
  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
    headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Apply rate limit
  if (!checkRateLimit(clientIp)) {
    const errorBody = {
      error: 'Rate limit exceeded. Maximum 10 briefing requests per minute per IP.',
      retryAfterSeconds: 60,
    };
    if (res && typeof res.status === 'function') {
      return res.status(429).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle request method
  const method = req.method || (req instanceof Request ? req.method : 'GET');
  if (method !== 'POST') {
    const errorBody = { error: 'Method not allowed. Use POST.' };
    if (res && typeof res.status === 'function') {
      return res.status(405).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse body
  let body: any = req.body;
  if (!body && typeof req.json === 'function') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const posts: IncomingPostItem[] = Array.isArray(body?.posts) ? body.posts : [];
  if (posts.length === 0) {
    const errorBody = { error: 'Missing posts array in request body.' };
    if (res && typeof res.status === 'function') {
      return res.status(400).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Server-side Gemini API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const errorBody = {
      error: 'GEMINI_API_KEY is not configured on the server.',
      fallbackAvailable: true,
    };
    if (res && typeof res.status === 'function') {
      return res.status(503).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Cap to 25 newest posts
  const cappedPosts = posts.slice(0, 25);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a veteran Trinidadian newsroom editor and senior intelligence analyst at Trending TT.
Synthesize the supplied news posts into structured editorial briefings for Trinidad & Tobago readers.

STRICT CONSTRAINTS:
1. Language: Trinidadian English, crisp newsroom style (e.g., Port of Spain, Chaguanas, San Fernando, Tobago).
2. NO EMOJIS: Do not use any AI emojis, robot symbols, or sparkles (NEVER use ✨, 🤖, 🦾, 🪄).
3. FACTUAL CITATION: For every single claim, cite the specific source name provided (e.g., CNC3, TV6, Newsday, T&TEC, WASA).
4. ZERO HALLUCINATION: Never invent or extrapolate facts not explicitly stated in the supplied post data.
5. Create exactly 4 briefings covering:
   - "Breaking News & Security Alerts" (category: "breaking")
   - "Trinbago Sports Arena Round-Up" (category: "sports")
   - "Trinbago Social Media Pulse" (category: "social")
   - "National Affairs & Utilities Intelligence" (category: "national")

SUPPLIED POSTS (JSON):
${JSON.stringify(
  cappedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary || '',
    sourceName: p.sourceName || 'Unknown Source',
    category: p.category || 'general',
    publishedAt: p.publishedAt,
    originalUrl: p.originalUrl || '',
  })),
  null,
  2
)}

Respond ONLY with valid JSON (no markdown formatting, no code fences):
[
  {
    "id": "brief-breaking-...",
    "topic": "Breaking News & Security Alerts",
    "category": "breaking",
    "title": "Headline",
    "executiveSummary": "Summary text",
    "keyTakeaways": ["Bullet 1", "Bullet 2"],
    "primarySources": [{"name": "Source Name", "url": "URL"}],
    "socialDrafts": {
      "whatsapp": "WhatsApp formatted text",
      "facebook": "Facebook formatted text",
      "xTwitter": "Twitter formatted text",
      "telegram": "Telegram formatted text"
    },
    "sourcePostIds": ["id1", "id2"]
  }
]`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const responseText = response.text?.trim() || '';
    const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed: IntelligenceBriefingResponse[] = JSON.parse(cleanJson);

    // Ensure generatedAt timestamp is attached
    const enriched = parsed.map((item) => ({
      ...item,
      id: item.id || `brief-${item.category}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
    }));

    if (res && typeof res.status === 'function') {
      return res.status(200).json(enriched);
    }
    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const errorBody = {
      error: 'Briefing synthesis failed on server: ' + (err?.message || String(err)),
      fallbackAvailable: true,
    };
    if (res && typeof res.status === 'function') {
      return res.status(500).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
