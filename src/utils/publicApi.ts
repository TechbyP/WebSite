import type { Article, ArticleContent } from '../admin/blog/types/articles';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { resolveApiUrl } from './api';

type AiSignalType = 'ai_referral' | 'feed_read' | 'ai_conversion';

type AiSignalPayload = {
  type: AiSignalType;
  source?: string;
  referrer?: string;
  landingPath?: string;
  feedPath?: string;
  conversionType?: string;
  conversionValue?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export interface PublicAnnouncementContent {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  dateInfo: string;
  location: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface PublicAnnouncementData {
  id: string;
  content: {
    en: PublicAnnouncementContent;
    de: PublicAnnouncementContent;
  };
  ctaPrimaryLink?: string;
  ctaSecondaryLink: string;
  imageUrl: string;
  isActive: boolean;
  showDelay: number;
  priority: number;
  createdAt?: string;
}

export interface PublicHeroItem {
  id: string;
  type: 'announcement' | 'event' | 'product' | 'blog';
  title_en: string;
  title_de: string;
  excerpt_en: string;
  excerpt_de: string;
  image: string;
  date?: string;
  link_en?: string;
  link_de?: string;
  cta_en?: string;
  cta_de?: string;
  order: number;
  isHomeScreen?: boolean;
}

export type PublicBlogArticle = Omit<Article, 'content'> & {
  content: Record<string, ArticleContent>;
  title?: Record<string, string>;
  featured?: boolean;
  trending?: boolean;
  views?: number;
  commentsCount?: number;
  relatedArticles?: PublicBlogArticle[];
};

type StaticBlogCache = {
  articles?: PublicBlogArticle[];
};

const AI_REFERRAL_SESSION_KEY = 'ai_referral_tracked_v1';
const ARTICLE_VIEW_CACHE_KEY_PREFIX = 'article_view_tracked_v1:';
const ARTICLE_VIEW_WINDOW_MS = 60 * 60 * 1000;
const FEED_SIGNAL_CACHE = new Set<string>();
const AI_REFERRER_PATTERNS = [
  'chat.openai.com',
  'chatgpt.com',
  'claude.ai',
  'perplexity.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'you.com',
  'phind.com',
  'poe.com',
  'meta.ai',
];

const sanitizeText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
};

const toClubMemberDocumentId = (email: string) => email.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 120);

const getArticleViewCacheKey = (articleId: string) => `${ARTICLE_VIEW_CACHE_KEY_PREFIX}${articleId}`;

const hasRecentArticleView = (articleId: string) => {
  if (typeof window === 'undefined') {
    return false;
  }

  const cachedValue = window.localStorage.getItem(getArticleViewCacheKey(articleId));

  if (!cachedValue) {
    return false;
  }

  const trackedAt = Number(cachedValue);

  if (!Number.isFinite(trackedAt)) {
    window.localStorage.removeItem(getArticleViewCacheKey(articleId));
    return false;
  }

  if (Date.now() - trackedAt >= ARTICLE_VIEW_WINDOW_MS) {
    window.localStorage.removeItem(getArticleViewCacheKey(articleId));
    return false;
  }

  return true;
};

const markArticleView = (articleId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getArticleViewCacheKey(articleId), String(Date.now()));
};

const optimizeRemoteImageUrl = (url: string, width = 1200) => {
  if (!url?.startsWith('http')) {
    return url || '';
  }

  if (url.includes('images.weserv.nl/?url=')) {
    return url;
  }

  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=78&output=webp`;
};

const parseJsonResponse = async <T>(response: Response, path: string): Promise<T> => {
  const responseText = await response.text().catch(() => '');

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}${responseText ? ` ${responseText.slice(0, 160)}` : ''}`);
  }

  const trimmedResponse = responseText.trim();

  try {
    return JSON.parse(responseText) as T;
  } catch {
    if (trimmedResponse.startsWith('<!DOCTYPE') || trimmedResponse.startsWith('<html')) {
      throw new Error(`Request failed: ${path} returned website HTML instead of JSON.`);
    }

    throw new Error(`Request failed: invalid JSON from ${path}`);
  }
};

const postAiSignal = async (payload: AiSignalPayload) => {
  try {
    await addDoc(collection(db, 'ai_signals'), {
      type: payload.type,
      source: sanitizeText(payload.source, 120),
      referrer: sanitizeText(payload.referrer, 500),
      landingPath: sanitizeText(payload.landingPath, 300),
      feedPath: sanitizeText(payload.feedPath, 300),
      conversionType: sanitizeText(payload.conversionType, 120),
      conversionValue: sanitizeText(payload.conversionValue, 180),
      utm_source: sanitizeText(payload.utm_source, 120),
      utm_medium: sanitizeText(payload.utm_medium, 120),
      utm_campaign: sanitizeText(payload.utm_campaign, 180),
      userAgent: typeof navigator !== 'undefined' ? sanitizeText(navigator.userAgent, 240) : '',
      timestamp: new Date().toISOString(),
      receivedAt: serverTimestamp(),
      sourceType: 'client-direct',
    });
  } catch {
    // Silent fail by design: telemetry should never impact page behavior.
  }
};

const normalizeSignalPath = (path: string) => {
  if (!path.startsWith('/')) {
    return path;
  }

  return path.split('?')[0];
};

const getUtmParams = () => {
  if (typeof window === 'undefined') {
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
    };
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlSearchParams.get('utm_source') || '',
    utm_medium: urlSearchParams.get('utm_medium') || '',
    utm_campaign: urlSearchParams.get('utm_campaign') || '',
  };
};

const trackFeedRead = (path: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedPath = normalizeSignalPath(path);

  if (!normalizedPath.startsWith('/content/')) {
    return;
  }

  if (FEED_SIGNAL_CACHE.has(normalizedPath)) {
    return;
  }

  FEED_SIGNAL_CACHE.add(normalizedPath);
  const utm = getUtmParams();
  void postAiSignal({
    type: 'feed_read',
    feedPath: normalizedPath,
    landingPath: `${window.location.pathname}${window.location.search}`,
    ...utm,
  });
};

export const trackAiReferralIfPresent = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (window.sessionStorage.getItem(AI_REFERRAL_SESSION_KEY) === '1') {
    return;
  }

  const referrer = document.referrer;

  if (!referrer) {
    return;
  }

  let hostname = '';

  try {
    hostname = new URL(referrer).hostname.toLowerCase();
  } catch {
    return;
  }

  const matchedSource = AI_REFERRER_PATTERNS.find(
    (candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`)
  );

  if (!matchedSource) {
    return;
  }

  window.sessionStorage.setItem(AI_REFERRAL_SESSION_KEY, '1');
  const utm = getUtmParams();
  void postAiSignal({
    type: 'ai_referral',
    source: matchedSource,
    referrer,
    landingPath: `${window.location.pathname}${window.location.search}`,
    ...utm,
  });
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(path);
  const parsedResponse = await parseJsonResponse<T>(response, path);
  trackFeedRead(path);
  return parsedResponse;
};

const withFallback = async <T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> => {
  try {
    return await primary();
  } catch {
    return fallback();
  }
};

const fetchStaticBlogCache = () => fetchJson<StaticBlogCache>('/content/blog-cache.json');

const fetchStaticArticles = async () => {
  const cache = await fetchStaticBlogCache();
  return Array.isArray(cache.articles) ? cache.articles : [];
};

export const fetchAnnouncements = () =>
  withFallback(
    () => fetchJson<PublicAnnouncementData[]>('/content/announcements.json'),
    () => fetchJson<PublicAnnouncementData[]>(resolveApiUrl('/data/announcements'))
  );

export const fetchHeroItems = () =>
  withFallback(
    () => fetchJson<PublicHeroItem[]>('/content/hero-items.json'),
    () => fetchJson<PublicHeroItem[]>(resolveApiUrl('/data/hero-items'))
  );

export const fetchArticles = () => withFallback(
  fetchStaticArticles,
  () => fetchJson<PublicBlogArticle[]>(resolveApiUrl('/data/articles'))
);

export const fetchArticleById = async (articleId: string) => {
  try {
    const articles = await fetchStaticArticles();
    const article = articles.find((entry) => entry.id === articleId);

    if (article) {
      return {
        ...article,
        commentsCount: Number(article.commentsCount ?? 0),
        views: Number(article.views ?? 0),
        relatedArticles: article.relatedArticles ?? [],
      };
    }

    return await fetchJson<PublicBlogArticle>(resolveApiUrl(`/data/articles/${articleId}`));
  } catch (error) {
    throw error;
  }
};

export { optimizeRemoteImageUrl };

export const trackArticleView = async (articleId: string) => {
  if (!articleId) {
    return { ok: true, throttled: true };
  }

  if (hasRecentArticleView(articleId)) {
    return { ok: true, throttled: true };
  }

  try {
    const articleRef = doc(db, 'articles', articleId);
    const articleSnapshot = await getDoc(articleRef).catch(() => null);
    const currentViews = articleSnapshot && articleSnapshot.exists()
      ? Number(articleSnapshot.data().views ?? 0)
      : undefined;

    await updateDoc(articleRef, {
      views: increment(1),
    });

    markArticleView(articleId);

    if (typeof currentViews === 'number' && Number.isFinite(currentViews)) {
      return { ok: true, views: currentViews + 1 };
    }

    return { ok: true };
  } catch {
    return { ok: true, throttled: true };
  }
};

export const submitNewsletterSignup = async ({
  email,
  source,
  honeypot,
}: {
  email: string;
  source: string;
  honeypot?: string;
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedSource = source?.trim() ? source.trim() : 'website';
  const honeypotValue = typeof honeypot === 'string' ? honeypot.trim() : '';

  if (honeypotValue) {
    throw new Error('Invalid signup payload.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('A valid email address is required.');
  }

  const memberDocRef = doc(db, 'club_members', toClubMemberDocumentId(normalizedEmail));
  await setDoc(memberDocRef, {
    email: normalizedEmail,
    source: normalizedSource,
    timestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { ok: true };
};

export const trackAiConversion = (conversionType: string, conversionValue = '') => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!conversionType || window.sessionStorage.getItem(AI_REFERRAL_SESSION_KEY) !== '1') {
    return;
  }

  const utm = getUtmParams();
  void postAiSignal({
    type: 'ai_conversion',
    conversionType,
    conversionValue,
    landingPath: `${window.location.pathname}${window.location.search}`,
    ...utm,
  });
};