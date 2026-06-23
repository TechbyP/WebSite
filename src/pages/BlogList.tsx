import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Clock, X } from 'lucide-react';
import { motion, useAnimation, AnimatePresence, useInView } from 'framer-motion';
import blog from '../assets/pictures/blog.jpg';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchArticles, optimizeRemoteImageUrl, type PublicBlogArticle as BlogArticle } from '../utils/publicApi';
import { buildCanonicalUrl } from '../utils/seo';

const humanizeCategory = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const FadeInWhenVisible = React.memo(({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
});

const BlogList = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const activeLanguage = useMemo(
    () => (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().split('-')[0],
    [i18n.language, i18n.resolvedLanguage]
  );

  const getLocalizedContent = (article: BlogArticle) => {
    const contentMap = article.content || {};
    const fallbackLanguage = contentMap.en ? 'en' : Object.keys(contentMap)[0];
    const targetLanguage = contentMap[activeLanguage] ? activeLanguage : fallbackLanguage;
    const content = targetLanguage ? contentMap[targetLanguage] : undefined;

    return {
      title: content?.title || 'No title available',
      excerpt: content?.excerpt || 'No excerpt available',
      content: content?.content || [],
    };
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'all') {
      return t('blog.categories.all');
    }

    return t(`blog.categories.${category}`, { defaultValue: humanizeCategory(category) });
  };

  const formatArticleDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(activeLanguage, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  };

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setArticles(await fetchArticles());
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(articles.map((article) => article.category)))],
    [articles]
  );

  const searchMatches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return articles;
    }

    return articles.filter((article) => {
      const localized = getLocalizedContent(article);
      const searchableText = [
        localized.title,
        localized.excerpt,
        getCategoryLabel(article.category),
        article.author?.name || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [articles, searchQuery, activeLanguage, t]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatches.forEach((article) => {
      counts.set(article.category, (counts.get(article.category) || 0) + 1);
    });

    return counts;
  }, [searchMatches]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') {
      return searchMatches;
    }

    return searchMatches.filter((article) => article.category === activeCategory);
  }, [activeCategory, searchMatches]);

  const spotlightArticle = useMemo(
    () => filteredArticles.find((article) => article.featured),
    [filteredArticles]
  );

  const trendingArticles = useMemo(
    () =>
      filteredArticles
        .filter((article) => article.trending && article.id !== spotlightArticle?.id)
        .slice(0, 3),
    [filteredArticles, spotlightArticle]
  );

  const latestArticles = useMemo(() => {
    const excludedIds = new Set<string>();

    if (spotlightArticle) {
      excludedIds.add(spotlightArticle.id);
    }

    trendingArticles.forEach((article) => excludedIds.add(article.id));

    return filteredArticles.filter((article) => !excludedIds.has(article.id));
  }, [filteredArticles, spotlightArticle, trendingArticles]);

  const hasActiveFilters = searchQuery.trim().length > 0 || activeCategory !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-gray-900 dark:text-gray-100">
      <Helmet>
        <title>{t('blog.meta.title')}</title>
        <meta name="description" content={t('blog.meta.description')} />
        <meta property="og:url" content={buildCanonicalUrl('/blog')} />
        <link rel="canonical" href={buildCanonicalUrl('/blog')} />
      </Helmet>

      <header className="bg-[#f8fafc] px-4 pt-4 text-white sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.85rem] border border-slate-200/70 bg-slate-950 shadow-sm dark:border-gray-800">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${blog})`,
              backgroundPosition: 'center 38%',
              filter: 'brightness(0.82)',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/48 via-slate-950/24 to-slate-950/16"></div>

          <div className="relative flex min-h-[112px] items-end px-5 py-5 sm:min-h-[132px] sm:px-7 sm:py-6 lg:min-h-[148px] lg:px-9">
            <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-2 inline-flex rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100/95 backdrop-blur-sm sm:text-[11px]">
                  TECHBYP / BLOG
                </p>
                <h1 className="text-2xl font-black uppercase leading-tight sm:text-[2rem] lg:text-[2.2rem]">
                  {t('blog.headings.insightsHub')}
                </h1>
                <p className="mt-1 max-w-2xl text-sm font-black leading-5 text-blue-100/92 sm:text-[15px] sm:leading-6">
                  {t('blog.headings.tagline')}
                </p>
              </div>

              <div className="w-full lg:max-w-sm lg:self-start">
                <label htmlFor="blog-search" className="sr-only">
                  {t('blog.placeholders.search')}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/65" />
                  <input
                    id="blog-search"
                    type="text"
                    placeholder={t('blog.placeholders.search')}
                    className="w-full rounded-full border border-white/20 bg-black/20 py-3 pl-12 pr-12 text-sm font-black text-white placeholder:text-white/65 backdrop-blur-md focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                      aria-label={t('blog.buttons.resetFilters')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-10 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === 'all' ? searchMatches.length : categoryCounts.get(category) || 0;
              const isActive = activeCategory === category;
              const isDisabled = category !== 'all' && count === 0;

              return (
                <motion.button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  disabled={isDisabled}
                  whileHover={isDisabled ? undefined : { y: -1 }}
                  whileTap={isDisabled ? undefined : { scale: 0.98 }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition ${
                    isActive
                      ? 'border-brandgreen bg-brandgreen text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                  } ${isDisabled ? 'cursor-not-allowed opacity-45' : ''}`}
                >
                  <span>{getCategoryLabel(category)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-950/70">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-black uppercase text-slate-900 dark:text-gray-100">
              {t('blog.empty.noArticles')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-black text-slate-600 dark:text-gray-300">
              {t('blog.empty.tryAdjusting')}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-brandgreen dark:text-slate-950 dark:hover:bg-green-400"
              >
                {t('blog.buttons.resetFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            {spotlightArticle && (
              <FadeInWhenVisible>
                <section className="mb-14">
                  <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-gray-100 md:text-4xl">
                    {t('blog.sections.featuredStory')}
                  </h2>
                  <Link
                    to={`/blog/${spotlightArticle.id}`}
                    className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/80"
                  >
                    <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                      <div className="relative min-h-[320px] overflow-hidden lg:min-h-[460px]">
                        <img
                          src={optimizeRemoteImageUrl(spotlightArticle.image, 1280)}
                          alt={getLocalizedContent(spotlightArticle).title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="eager"
                          decoding="async"
                          sizes="(max-width: 1024px) 100vw, 56vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                        <div className="absolute left-6 top-6 rounded-full bg-brandgreen px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-brandgreen/30">
                          {t('blog.labels.featured')}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between p-7 sm:p-8 lg:p-10">
                        <div>
                          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-black text-slate-500 dark:text-gray-400">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-brandblue dark:bg-gray-800 dark:text-blue-300">
                              {getCategoryLabel(spotlightArticle.category)}
                            </span>
                            <span>{formatArticleDate(spotlightArticle.date)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {spotlightArticle.readTime}
                            </span>
                          </div>

                          <h3 className="text-3xl font-black leading-tight text-slate-950 transition-colors group-hover:text-brandblue dark:text-gray-100 dark:group-hover:text-blue-300 lg:text-4xl">
                            {getLocalizedContent(spotlightArticle).title}
                          </h3>

                          <p className="mt-5 text-base font-black leading-7 text-slate-600 dark:text-gray-300">
                            {getLocalizedContent(spotlightArticle).excerpt}
                          </p>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-gray-800">
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-wide text-slate-400 dark:text-gray-500">
                              {spotlightArticle.author?.role}
                            </p>
                            <p className="truncate text-lg font-black text-slate-900 dark:text-gray-100">
                              {spotlightArticle.author?.name}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-brandblue transition group-hover:gap-3 dark:text-blue-300">
                            {t('blog.buttons.continueReading')}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </section>
              </FadeInWhenVisible>
            )}

            {trendingArticles.length > 0 && (
              <FadeInWhenVisible>
                <section className="mb-14">
                  <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-gray-100 md:text-4xl">
                    {t('blog.sections.trendingNow')}
                  </h2>

                  <div className="grid gap-5 lg:grid-cols-3">
                    {trendingArticles.map((article) => {
                      const localized = getLocalizedContent(article);

                      return (
                        <motion.article
                          key={article.id}
                          whileHover={{ y: -4 }}
                          className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/80"
                        >
                          <Link to={`/blog/${article.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={optimizeRemoteImageUrl(article.image, 720)}
                                alt={localized.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                                sizes="(max-width: 1024px) 100vw, 33vw"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5">
                                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                                  {t('blog.labels.trending')}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-gray-400">
                                <span className="text-brandblue dark:text-blue-300">{getCategoryLabel(article.category)}</span>
                                <span>{formatArticleDate(article.date)}</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {article.readTime}
                                </span>
                              </div>

                              <h3 className="text-2xl font-black leading-tight text-slate-950 transition-colors group-hover:text-brandblue dark:text-gray-100 dark:group-hover:text-blue-300">
                                {localized.title}
                              </h3>
                              <p className="mt-4 line-clamp-3 text-sm font-black leading-6 text-slate-600 dark:text-gray-300">
                                {localized.excerpt}
                              </p>

                              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black uppercase tracking-wide text-brandblue dark:text-blue-300">
                                {t('blog.buttons.continueReading')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            </div>
                          </Link>
                        </motion.article>
                      );
                    })}
                  </div>
                </section>
              </FadeInWhenVisible>
            )}

            {latestArticles.length > 0 && (
              <FadeInWhenVisible>
                <section>
                  <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-gray-100 md:text-4xl">
                    {t('blog.sections.latestArticles')}
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {latestArticles.map((article) => {
                        const localized = getLocalizedContent(article);

                        return (
                          <motion.article
                            key={article.id}
                            layout
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.28 }}
                            className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/80"
                          >
                            <Link to={`/blog/${article.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                              <div className="relative h-56 overflow-hidden">
                                <img
                                  src={optimizeRemoteImageUrl(article.image, 720)}
                                  alt={localized.title}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                  loading="lazy"
                                  decoding="async"
                                  sizes="(max-width: 1280px) 50vw, 33vw"
                                />
                                {(article.featured || article.trending) && (
                                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                    {article.featured && (
                                      <span className="rounded-full bg-brandgreen px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        {t('blog.labels.featured')}
                                      </span>
                                    )}
                                    {article.trending && (
                                      <span className="rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-sm dark:bg-white/15">
                                        {t('blog.labels.trending')}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-1 flex-col p-6">
                                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-gray-400">
                                  <span className="text-brandblue dark:text-blue-300">{getCategoryLabel(article.category)}</span>
                                  <span>{formatArticleDate(article.date)}</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {article.readTime}
                                  </span>
                                </div>

                                <h3 className="text-2xl font-black leading-tight text-slate-950 transition-colors group-hover:text-brandblue dark:text-gray-100 dark:group-hover:text-blue-300">
                                  {localized.title}
                                </h3>

                                <p className="mt-4 line-clamp-3 text-sm font-black leading-6 text-slate-600 dark:text-gray-300">
                                  {localized.excerpt}
                                </p>

                                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-6 dark:border-gray-800">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-slate-900 dark:text-gray-100">
                                      {article.author?.name}
                                    </p>
                                    <p className="truncate text-xs font-black uppercase tracking-wide text-slate-400 dark:text-gray-500">
                                      {article.author?.role}
                                    </p>
                                  </div>

                                  <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-brandblue dark:text-blue-300">
                                    {t('blog.buttons.readMore')}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </motion.article>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </section>
              </FadeInWhenVisible>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BlogList;