import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, getApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore as getAdminFirestore, Timestamp } from 'firebase-admin/firestore';

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ProviderConfig = {
  name: string;
  key: string;
  model: string;
  endpoint: string;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const envFileName of ['.env.local', '.env']) {
  const envFilePath = path.join(APP_ROOT, envFileName);

  if (!existsSync(envFilePath)) {
    continue;
  }

  try {
    process.loadEnvFile(envFilePath);
  } catch (error) {
    console.warn(
      JSON.stringify({
        scope: 'env-load',
        file: envFileName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
  }
}

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const MAX_REQUESTS_PER_MINUTE = Number(process.env.CHAT_RATE_LIMIT_PER_MINUTE ?? 10);
const MAX_VIOLATIONS_PER_HOUR = Number(process.env.CHAT_MAX_VIOLATIONS_PER_HOUR ?? 20);
const MAX_NEWSLETTER_REQUESTS_PER_HOUR = Number(process.env.NEWSLETTER_RATE_LIMIT_PER_HOUR ?? 5);
const MAX_AI_SIGNALS_PER_HOUR = Number(process.env.AI_SIGNALS_RATE_LIMIT_PER_HOUR ?? 120);
const PUBLIC_DATA_CACHE_MS = Number(process.env.PUBLIC_DATA_CACHE_MS ?? 5 * 60_000);
const WINDOW_MS = 60_000;
const VIOLATION_WINDOW_MS = 60 * 60_000;
const NEWSLETTER_WINDOW_MS = 60 * 60_000;
const AI_SIGNAL_WINDOW_MS = 60 * 60_000;
const ARTICLE_VIEW_WINDOW_MS = 60 * 60_000;
const EDGE_FEED_LOG_WINDOW_MS = 2 * 60_000;
const MAX_ADMIN_AI_SIGNAL_ROWS = 500;
const SERVICE_ACCOUNT_PATH = path.join(APP_ROOT, 'serviceAccountKey.json');
const PUBLIC_CONTENT_DIR = path.join(APP_ROOT, 'public', 'content');
const AI_FEED_LOGGABLE_PATHS = new Set([
  '/content/ai-manifest.json',
  '/content/products.json',
  '/content/blog-index.json',
  '/content/faq.json',
  '/content/announcements.json',
  '/content/hero-items.json',
]);
const AI_BOT_USER_AGENT_PATTERNS = [
  'gptbot',
  'chatgpt-user',
  'claudebot',
  'perplexitybot',
  'cohere-ai',
  'bytespider',
  'meta-externalagent',
  'google-extended',
  'ccbot',
  'youbot',
];

type StaticBlogCache = {
  articles?: Record<string, unknown>[];
};

const requestBuckets = new Map<string, number[]>();
const abuseBuckets = new Map<string, number[]>();
const newsletterBuckets = new Map<string, number[]>();
const aiSignalBuckets = new Map<string, number[]>();
const publicCache = new Map<string, CacheEntry<unknown>>();
const articleViewBuckets = new Map<string, number>();
const edgeFeedSignalBuckets = new Map<string, number>();
let providerIndex = 0;

let adminDb: ReturnType<typeof getAdminFirestore> | null = null;
let adminDbError: Error | null = null;

try {
  if (getApps().length === 0) {
    if (existsSync(SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
      initializeAdminApp({ credential: cert(serviceAccount) });
    } else {
      initializeAdminApp();
    }
  }

  adminDb = getAdminFirestore();
} catch (error) {
  adminDbError = error instanceof Error ? error : new Error('Failed to initialize Firebase Admin.');
  console.error(
    JSON.stringify({
      scope: 'firebase-admin-init',
      error: adminDbError.message,
      timestamp: new Date().toISOString(),
    })
  );
}

const providers: ProviderConfig[] = [
  {
    name: 'Groq Llama On Demand',
    key: process.env.GROQ_API_KEY_1 ?? process.env.VITE_GROQ_API_KEY_1 ?? '',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    name: 'Groq Llama On Demand 2',
    key: process.env.GROQ_API_KEY_2 ?? process.env.VITE_GROQ_API_KEY_2 ?? '',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    name: 'Together AI',
    key: process.env.TOGETHER_API_KEY_3 ?? process.env.VITE_TOGETHER_API_KEY_3 ?? '',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
  },
].filter((provider) => provider.key);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use((request, _response, next) => {
  const userAgent = sanitizeOptionalString(request.get('user-agent') ?? '', 240);
  const clientId = getClientId(request);

  if (shouldLogEdgeFeedSignal(request, clientId, userAgent)) {
    const signalPayload = {
      type: 'feed_access_edge',
      source: 'edge-proxy',
      referrer: sanitizeOptionalString(request.get('referer') ?? '', 500),
      landingPath: sanitizeOptionalString(request.originalUrl, 300),
      feedPath: sanitizeOptionalString(request.path, 300),
      userAgent,
      clientHash: hashClientId(clientId),
      timestamp: new Date().toISOString(),
      receivedAt: new Date(),
      ...getUtmFromRequest(request),
    };

    void persistAiSignal(signalPayload);
  }

  next();
});

const toSerializable = (value: unknown): unknown => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toSerializable(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, toSerializable(entry)])
    );
  }

  return value;
};

const getCachedValue = async <T>(cacheKey: string, loader: () => Promise<T>) => {
  const now = Date.now();
  const cachedEntry = publicCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.value;
  }

  const value = await loader();
  publicCache.set(cacheKey, { value, expiresAt: now + PUBLIC_DATA_CACHE_MS });
  return value;
};

const readStaticJson = <T>(fileName: string, fallbackValue: T): T => {
  const filePath = path.join(PUBLIC_CONTENT_DIR, fileName);

  if (!existsSync(filePath)) {
    return fallbackValue;
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallbackValue;
  }
};

const getStaticAnnouncements = () => readStaticJson<Record<string, unknown>[]>('announcements.json', []);

const getStaticHeroItems = () => readStaticJson<Record<string, unknown>[]>('hero-items.json', []);

const getStaticArticles = () => {
  const cache = readStaticJson<StaticBlogCache>('blog-cache.json', { articles: [] });
  return Array.isArray(cache.articles) ? cache.articles : [];
};

const getStaticArticleById = (articleId: string) => {
  const article = getStaticArticles().find((entry) => String(entry.id ?? '') === articleId);

  if (!article) {
    return null;
  }

  return {
    ...article,
    commentsCount: Number(article.commentsCount ?? 0),
    views: Number(article.views ?? 0),
    relatedArticles: Array.isArray(article.relatedArticles) ? article.relatedArticles : [],
  };
};

const pruneBucket = (bucket: Map<string, number[]>, key: string, windowMs: number) => {
  const now = Date.now();
  const entries = bucket.get(key) ?? [];
  const freshEntries = entries.filter((timestamp) => now - timestamp < windowMs);
  bucket.set(key, freshEntries);
  return freshEntries;
};

const getClientId = (request: express.Request) => {
  const forwardedFor = request.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];

  return firstForwarded?.trim() || request.ip || request.socket.remoteAddress || 'unknown';
};

const hashClientId = (clientId: string) => createHash('sha256').update(clientId).digest('hex');

const sanitizeOptionalString = (value: unknown, maxLength = 500) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  return trimmed.slice(0, maxLength);
};

const isAiBotUserAgent = (userAgent: string) => {
  const normalizedUserAgent = userAgent.toLowerCase();
  return AI_BOT_USER_AGENT_PATTERNS.some((pattern) => normalizedUserAgent.includes(pattern));
};

const getUtmFromRequest = (request: express.Request) => ({
  utm_source: sanitizeOptionalString(request.query.utm_source, 120),
  utm_medium: sanitizeOptionalString(request.query.utm_medium, 120),
  utm_campaign: sanitizeOptionalString(request.query.utm_campaign, 180),
});

const shouldLogEdgeFeedSignal = (request: express.Request, clientId: string, userAgent: string) => {
  if (!AI_FEED_LOGGABLE_PATHS.has(request.path)) {
    return false;
  }

  if (!isAiBotUserAgent(userAgent)) {
    return false;
  }

  const dedupeKey = `${request.path}:${hashClientId(clientId)}`;
  const lastLoggedAt = edgeFeedSignalBuckets.get(dedupeKey);

  if (lastLoggedAt && Date.now() - lastLoggedAt < EDGE_FEED_LOG_WINDOW_MS) {
    return false;
  }

  edgeFeedSignalBuckets.set(dedupeKey, Date.now());
  return true;
};

const persistAiSignal = async (payload: Record<string, unknown>) => {
  if (!adminDb) {
    console.info(
      JSON.stringify({
        scope: 'ai-signals',
        ...payload,
      })
    );
    return false;
  }

  try {
    await adminDb.collection('ai_signals').add(payload);
    return true;
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'ai-signals',
        clientHash: payload.clientHash,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    return false;
  }
};

const logAbuseEvent = (clientId: string, reason: string, metadata: Record<string, unknown> = {}) => {
  const violationTimestamps = pruneBucket(abuseBuckets, clientId, VIOLATION_WINDOW_MS);
  violationTimestamps.push(Date.now());
  abuseBuckets.set(clientId, violationTimestamps);

  console.warn(
    JSON.stringify({
      scope: 'chat-abuse-monitor',
      clientId,
      reason,
      violationsLastHour: violationTimestamps.length,
      metadata,
      timestamp: new Date().toISOString(),
    })
  );
};

const requireAdminDb = (response: express.Response) => {
  if (adminDb) {
    return adminDb;
  }

  response.status(503).json({
    error: adminDbError?.message ?? 'Server-side Firestore is not configured.',
  });
  return null;
};

const getBearerToken = (request: express.Request) => {
  const authorizationHeader = request.get('authorization') ?? '';

  if (!authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorizationHeader.slice(7).trim();
};

const verifyFirebaseUser = async (request: express.Request, response: express.Response) => {
  const token = getBearerToken(request);

  if (!token) {
    response.status(401).json({ error: 'Missing authentication token.' });
    return null;
  }

  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    response.status(401).json({ error: 'Invalid authentication token.' });
    return null;
  }
};

const parsePositiveInteger = (value: unknown, fallbackValue: number, maxValue: number) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return Math.min(parsedValue, maxValue);
};

const validateMessages = (messages: unknown): messages is ChatMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 25) {
    return false;
  }

  return messages.every((message) => {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const { role, content } = message as Partial<ChatMessage>;
    return (
      (role === 'system' || role === 'user' || role === 'assistant')
      && typeof content === 'string'
      && content.trim().length > 0
      && content.length <= 6000
    );
  });
};

const enforceRateLimit = (clientId: string) => {
  const requestTimestamps = pruneBucket(requestBuckets, clientId, WINDOW_MS);

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    logAbuseEvent(clientId, 'rate_limit_exceeded', {
      requestCount: requestTimestamps.length,
      limit: MAX_REQUESTS_PER_MINUTE,
    });

    const violationCount = pruneBucket(abuseBuckets, clientId, VIOLATION_WINDOW_MS).length;
    if (violationCount >= MAX_VIOLATIONS_PER_HOUR) {
      logAbuseEvent(clientId, 'temporary_block', { limit: MAX_VIOLATIONS_PER_HOUR });
    }

    return false;
  }

  requestTimestamps.push(Date.now());
  requestBuckets.set(clientId, requestTimestamps);
  return true;
};

const enforceNewsletterRateLimit = (clientId: string) => {
  const requestTimestamps = pruneBucket(newsletterBuckets, clientId, NEWSLETTER_WINDOW_MS);

  if (requestTimestamps.length >= MAX_NEWSLETTER_REQUESTS_PER_HOUR) {
    logAbuseEvent(clientId, 'newsletter_rate_limit_exceeded', {
      requestCount: requestTimestamps.length,
      limit: MAX_NEWSLETTER_REQUESTS_PER_HOUR,
    });
    return false;
  }

  requestTimestamps.push(Date.now());
  newsletterBuckets.set(clientId, requestTimestamps);
  return true;
};

const enforceAiSignalRateLimit = (clientId: string) => {
  const signalTimestamps = pruneBucket(aiSignalBuckets, clientId, AI_SIGNAL_WINDOW_MS);

  if (signalTimestamps.length >= MAX_AI_SIGNALS_PER_HOUR) {
    logAbuseEvent(clientId, 'ai_signal_rate_limit_exceeded', {
      requestCount: signalTimestamps.length,
      limit: MAX_AI_SIGNALS_PER_HOUR,
    });
    return false;
  }

  signalTimestamps.push(Date.now());
  aiSignalBuckets.set(clientId, signalTimestamps);
  return true;
};

const getOrderedProviders = () => {
  if (providers.length === 0) {
    return [];
  }

  return providers.map((_, offset) => providers[(providerIndex + offset) % providers.length]);
};

const buildFallbackChatMessage = (messages: ChatMessage[]): ChatMessage => {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user')?.content.toLowerCase() ?? '';

  let recommendation = 'A good starting point is the MP-1.90, MP-2.60, MP-3.90, MP-4.100, DH-1.30, DE-1.30, and BOPROB III pages in the product catalog.';

  if (/electric|battery|quiet|de-1\.30/.test(lastUserMessage)) {
    recommendation = 'If you need electric sampling, start with DE-1.30 and the electric Power Pack.';
  } else if (/hydraulic|torque|dh-1\.30/.test(lastUserMessage)) {
    recommendation = 'If you need hydraulic sampling, start with DH-1.30 or the MP-series systems, depending on your target depth.';
  } else if (/deep|depth|90|100|n-min|mp-1\.90|mp-2\.60|mp-3\.90|mp-4\.100/.test(lastUserMessage)) {
    recommendation = 'For deeper N-min and layered sampling, compare MP-1.90, MP-2.60, MP-3.90, and MP-4.100.';
  } else if (/trailer|tow|boprob|field hauler|hitch/.test(lastUserMessage)) {
    recommendation = 'For tow-behind and vehicle-mounted work, look at BOPROB III, Special Trailers, the Lay-down Frame, and the Tractor 3-Point Hitch frame.';
  } else if (/camera|light|led|coolbox|accessor|probe|hammer/.test(lastUserMessage)) {
    recommendation = 'For accessories, check Coolbox 95L, LED Work Light 1700, External Camera, Probes and Accessories, and the Hammers selection.';
  }

  return {
    role: 'assistant',
    content: `The live AI assistant is temporarily unavailable, but I can still point you in the right direction. ${recommendation} If you need a tailored recommendation right now, please use the catalog links on this page or contact TechByP directly.`
  };
};

const getArticleViewKey = (clientId: string, articleId: string) => `${clientId}:${articleId}`;

const hasRecentArticleView = (clientId: string, articleId: string) => {
  const key = getArticleViewKey(clientId, articleId);
  const lastViewAt = articleViewBuckets.get(key);

  if (!lastViewAt) {
    return false;
  }

  if (Date.now() - lastViewAt >= ARTICLE_VIEW_WINDOW_MS) {
    articleViewBuckets.delete(key);
    return false;
  }

  return true;
};

const markArticleView = (clientId: string, articleId: string) => {
  articleViewBuckets.set(getArticleViewKey(clientId, articleId), Date.now());
};

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, providers: providers.length });
});

app.get('/api/admin/ai-signals', async (request, response) => {
  const firestore = requireAdminDb(response);

  if (!firestore) {
    return;
  }

  const decodedToken = await verifyFirebaseUser(request, response);

  if (!decodedToken) {
    return;
  }

  const rowLimit = parsePositiveInteger(request.query.limit, 300, MAX_ADMIN_AI_SIGNAL_ROWS);

  try {
    let snapshot;

    try {
      snapshot = await firestore
        .collection('ai_signals')
        .orderBy('receivedAt', 'desc')
        .limit(rowLimit)
        .get();
    } catch {
      snapshot = await firestore
        .collection('ai_signals')
        .orderBy('timestamp', 'desc')
        .limit(rowLimit)
        .get();
    }

    const signals = snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...toSerializable(documentSnapshot.data()),
    }));

    response.json({
      ok: true,
      count: signals.length,
      requestedBy: decodedToken.uid,
      signals,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'admin-ai-signals-read',
        uid: decodedToken.uid,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.status(502).json({ error: 'Unable to load AI telemetry signals.' });
  }
});

app.get('/data/announcements', async (_request, response) => {
  const fallbackAnnouncements = getStaticAnnouncements();
  const firestore = adminDb;

  if (!firestore) {
    response.json(fallbackAnnouncements);
    return;
  }

  try {
    const announcements = await getCachedValue('announcements', async () => {
      const snapshot = await firestore
        .collection('announcements')
        .where('isActive', '==', true)
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }));
    });

    response.json(announcements);
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'public-data',
        resource: 'announcements',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.json(fallbackAnnouncements);
  }
});

app.get('/data/hero-items', async (_request, response) => {
  const fallbackHeroItems = getStaticHeroItems();
  const firestore = adminDb;

  if (!firestore) {
    response.json(fallbackHeroItems);
    return;
  }

  try {
    const heroItems = await getCachedValue('hero-items', async () => {
      const snapshot = await firestore.collection('heroItems').orderBy('order', 'asc').get();

      return snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }));
    });

    response.json(heroItems);
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'public-data',
        resource: 'hero-items',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.json(fallbackHeroItems);
  }
});

app.get('/data/articles', async (_request, response) => {
  const fallbackArticles = getStaticArticles();
  const firestore = adminDb;

  if (!firestore) {
    response.json(fallbackArticles);
    return;
  }

  try {
    const articles = await getCachedValue('articles', async () => {
      const snapshot = await firestore.collection('articles').orderBy('date', 'desc').get();

      return snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }));
    });

    response.json(articles);
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'public-data',
        resource: 'articles',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.json(fallbackArticles);
  }
});

app.get('/data/articles/:id', async (request, response) => {
  const articleId = request.params.id;
  const fallbackArticle = getStaticArticleById(articleId);
  const firestore = adminDb;

  if (!firestore) {
    if (!fallbackArticle) {
      response.status(404).json({ error: 'Article not found.' });
      return;
    }

    response.json(fallbackArticle);
    return;
  }

  try {
    const article = await getCachedValue(`article:${articleId}`, async () => {
      const articleSnapshot = await firestore.collection('articles').doc(articleId).get();

      if (!articleSnapshot.exists) {
        return null;
      }

      const articleData = {
        id: articleSnapshot.id,
        ...toSerializable(articleSnapshot.data()),
      } as Record<string, unknown>;

      const category = typeof articleData.category === 'string' ? articleData.category : '';

      const [relatedSnapshot, commentsSnapshot] = await Promise.all([
        category
          ? firestore.collection('articles').where('category', '==', category).get()
          : Promise.resolve(null),
        firestore.collection('comments').where('productId', '==', articleId).get(),
      ]);

      const relatedArticles = relatedSnapshot
        ? relatedSnapshot.docs
          .filter((documentSnapshot) => documentSnapshot.id !== articleId)
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            ...toSerializable(documentSnapshot.data()),
          }))
          .sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')))
          .slice(0, 3)
        : [];

      return {
        ...articleData,
        relatedArticles,
        commentsCount: commentsSnapshot.size,
        views: Number(articleData.views ?? 0),
      };
    });

    if (!article) {
      response.status(404).json({ error: 'Article not found.' });
      return;
    }

    response.json(article);
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'public-data',
        resource: 'article-detail',
        articleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    if (!fallbackArticle) {
      response.status(502).json({ error: 'Unable to load article.' });
      return;
    }

    response.json(fallbackArticle);
  }
});

app.post('/api/articles/:id/view', async (request, response) => {
  const firestore = adminDb;

  if (!firestore) {
    response.status(202).json({ ok: true, throttled: true });
    return;
  }

  const articleId = request.params.id;
  const clientId = getClientId(request);

  try {
    const articleRef = firestore.collection('articles').doc(articleId);
    const articleSnapshot = await articleRef.get();

    if (!articleSnapshot.exists) {
      response.status(404).json({ error: 'Article not found.' });
      return;
    }

    const currentViews = Number(articleSnapshot.data()?.views ?? 0);

    if (hasRecentArticleView(clientId, articleId)) {
      response.status(202).json({ ok: true, throttled: true, views: currentViews });
      return;
    }

    await articleRef.set({ views: FieldValue.increment(1) }, { merge: true });
    markArticleView(clientId, articleId);
    publicCache.delete(`article:${articleId}`);
    publicCache.delete('articles');

    response.status(202).json({ ok: true, views: currentViews + 1 });
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'article-view',
        articleId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.status(202).json({ ok: true, throttled: true });
  }
});

app.post('/api/newsletter-signup', async (request, response) => {
  const firestore = requireAdminDb(response);

  if (!firestore) {
    return;
  }

  const clientId = getClientId(request);

  if (!enforceNewsletterRateLimit(clientId)) {
    response.status(429).json({ error: 'Too many signup attempts. Please try again later.' });
    return;
  }

  const { email, source, honeypot } = request.body as {
    email?: unknown;
    source?: unknown;
    honeypot?: unknown;
  };

  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    logAbuseEvent(clientId, 'newsletter_honeypot_triggered');
    response.status(400).json({ error: 'Invalid signup payload.' });
    return;
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!isValidEmail) {
    response.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : 'website';

  try {
    await firestore.collection('club_members').add({
      email: normalizedEmail,
      source: normalizedSource,
      timestamp: new Date(),
    });

    publicCache.delete('articles');
    response.status(201).json({ ok: true });
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'newsletter-signup',
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    );
    response.status(502).json({ error: 'Unable to save newsletter signup.' });
  }
});

app.post('/api/ai-signals', async (request, response) => {
  const clientId = getClientId(request);

  if (!enforceAiSignalRateLimit(clientId)) {
    response.status(202).json({ ok: true, throttled: true });
    return;
  }

  const {
    type,
    source,
    referrer,
    landingPath,
    feedPath,
    conversionType,
    conversionValue,
    utm_source,
    utm_medium,
    utm_campaign,
  } = request.body as {
    type?: unknown;
    source?: unknown;
    referrer?: unknown;
    landingPath?: unknown;
    feedPath?: unknown;
    conversionType?: unknown;
    conversionValue?: unknown;
    utm_source?: unknown;
    utm_medium?: unknown;
    utm_campaign?: unknown;
  };

  if (type !== 'ai_referral' && type !== 'feed_read' && type !== 'ai_conversion') {
    response.status(400).json({ error: 'Invalid signal type.' });
    return;
  }

  const signalPayload = {
    type,
    source: sanitizeOptionalString(source, 120),
    referrer: sanitizeOptionalString(referrer, 500),
    landingPath: sanitizeOptionalString(landingPath, 300),
    feedPath: sanitizeOptionalString(feedPath, 300),
    conversionType: sanitizeOptionalString(conversionType, 120),
    conversionValue: sanitizeOptionalString(conversionValue, 180),
    userAgent: sanitizeOptionalString(request.get('user-agent') ?? '', 240),
    utm_source: sanitizeOptionalString(utm_source, 120),
    utm_medium: sanitizeOptionalString(utm_medium, 120),
    utm_campaign: sanitizeOptionalString(utm_campaign, 180),
    clientHash: hashClientId(clientId),
    timestamp: new Date().toISOString(),
    receivedAt: new Date(),
  };

  const stored = await persistAiSignal(signalPayload);
  response.status(202).json({ ok: true, stored });
});

app.post('/api/chat', async (request, response) => {
  const clientId = getClientId(request);
  if (!enforceRateLimit(clientId)) {
    response.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    return;
  }

  const { messages } = request.body as { messages?: unknown };
  if (!validateMessages(messages)) {
    logAbuseEvent(clientId, 'invalid_payload');
    response.status(400).json({ error: 'Invalid chat payload.' });
    return;
  }

  if (providers.length === 0) {
    response.json({
      degraded: true,
      message: buildFallbackChatMessage(messages),
    });
    return;
  }

  let lastError: string | null = null;

  for (const [index, provider] of getOrderedProviders().entries()) {
    try {
      const providerResponse = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
        }),
      });

      if (!providerResponse.ok) {
        lastError = `${provider.name} responded with ${providerResponse.status}`;

        if (providerResponse.status === 429 || providerResponse.status === 403) {
          continue;
        }

        const responseBody = await providerResponse.text();
        throw new Error(`${lastError}: ${responseBody}`);
      }

      const data = await providerResponse.json() as {
        choices?: Array<{ message?: ChatMessage }>;
      };
      const message = data.choices?.[0]?.message;

      if (!message || typeof message.content !== 'string') {
        throw new Error(`${provider.name} returned an invalid message payload.`);
      }

      providerIndex = (providerIndex + index + 1) % providers.length;
      response.json({ message, provider: provider.name });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown upstream error';
      console.error(
        JSON.stringify({
          scope: 'chat-proxy',
          provider: provider.name,
          clientId,
          error: lastError,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  response.json({
    degraded: true,
    message: buildFallbackChatMessage(messages),
    error: lastError ?? 'All chat providers failed.',
  });
});

app.listen(PORT, () => {
  console.log(`Chat proxy listening on http://localhost:${PORT}`);
});