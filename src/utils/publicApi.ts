import type { Article, ArticleContent } from '../admin/blog/types/articles';

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

const optimizeRemoteImageUrl = (url: string, width = 1200) => {
  if (!url?.startsWith('http')) {
    return url || '';
  }

  if (url.includes('images.weserv.nl/?url=')) {
    return url;
  }

  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=78&output=webp`;
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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
    () => fetchJson<PublicAnnouncementData[]>('/data/announcements')
  );

export const fetchHeroItems = () =>
  withFallback(
    () => fetchJson<PublicHeroItem[]>('/content/hero-items.json'),
    () => fetchJson<PublicHeroItem[]>('/data/hero-items')
  );

export const fetchArticles = () => withFallback(
  fetchStaticArticles,
  () => fetchJson<PublicBlogArticle[]>('/data/articles')
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

    return await fetchJson<PublicBlogArticle>(`/data/articles/${articleId}`);
  } catch (error) {
    throw error;
  }
};

export { optimizeRemoteImageUrl };

export const trackArticleView = async (articleId: string) => {
  try {
    const response = await fetch(`/api/articles/${articleId}/view`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<{ ok: boolean; throttled?: boolean; views?: number }>;
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
  const response = await fetch('/api/newsletter-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, source, honeypot }),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<{ ok: boolean }>;
};