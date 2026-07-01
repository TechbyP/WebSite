import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, MessageSquare, Printer, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Comments from '../utils/Comments';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { formatContentForDisplay, generateExcerpt } from '../admin/formatting';
import { fetchArticleById, optimizeRemoteImageUrl, trackArticleView, type PublicBlogArticle } from '../utils/publicApi';
import { buildCanonicalUrl, normalizeResourceId, toAbsoluteUrl } from '../utils/seo';

const ArticleDetail = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().split('-')[0];
  const { id } = useParams();
  const normalizedArticleId = normalizeResourceId(id);
  const navigate = useNavigate();
  const [article, setArticle] = useState<PublicBlogArticle | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [views, setViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentContent = article?.content?.[currentLanguage] || article?.content?.en || { title: '', content: [], excerpt: '' };
  const currentTitle = currentContent.title || article?.title?.[currentLanguage] || article?.title?.en || '';
  const articleUrl = buildCanonicalUrl(`/blog/${normalizedArticleId}`);
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: currentTitle,
    description: currentContent.excerpt || generateExcerpt(currentContent.content),
    image: [toAbsoluteUrl(article.image)],
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'TechByP',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechByP',
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/Logo-Symbol.png'),
      },
    },
    mainEntityOfPage: articleUrl,
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: buildCanonicalUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: currentTitle || 'Article',
        item: articleUrl,
      },
    ],
  };

  useEffect(() => {
    if (!normalizedArticleId) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const articleData = await fetchArticleById(normalizedArticleId);

        setViews(articleData.views || 0);
        setCommentsCount(articleData.commentsCount || 0);
        setArticle({
          ...articleData,
          image: optimizeRemoteImageUrl(articleData.image, 1280),
        });

        void trackArticleView(normalizedArticleId)
          .then((result) => {
            if (typeof result.views === 'number') {
              setViews(result.views);
            }
          })
          .catch(() => undefined);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : t('failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [normalizedArticleId, t]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const title = currentTitle || t('checkThisArticle');
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${t('checkThisArticle')}: ${currentUrl}`)}`;
        break;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
    setShowShareOptions(false);
  };

  const handlePrint = () => window.print();

  const renderedContent = useMemo(
    () => formatContentForDisplay(currentContent.content),
    [currentContent.content]
  );


  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{t('loadingArticle')}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center max-w-md">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">{t('errorLoadingArticle')}</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200">{error}</p>
        <button onClick={() => navigate('/blog')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {t('backToBlog')}
        </button>
      </div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('articleNotFound')}</h2>
        <button onClick={() => navigate('/blog')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {t('backToBlog')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900">
      <Helmet>
        <title>{`${currentTitle} | TECHBYP Blog`}</title>
        <meta name="description" content={currentContent.excerpt || generateExcerpt(currentContent.content)} />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={articleUrl} />
        {articleSchema ? <script type="application/ld+json">{JSON.stringify(articleSchema)}</script> : null}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <header
        className={`sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-950/85 ${isScrolled ? 'py-2' : 'py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('backToArticles')}
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100"
                aria-label={t('share')}
              >
                <Share2 className="h-5 w-5" />
              </button>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  {['twitter', 'linkedin', 'email'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors capitalize text-gray-700 dark:text-gray-200"
                    >
                      {t(platform)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <button onClick={handlePrint} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100" aria-label={t('print')}>
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 text-gray-900 dark:text-gray-100 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/80">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative min-h-[320px] overflow-hidden lg:min-h-[520px]">
              <img
                sizes="(max-width: 1024px) 100vw, 55vw"
                srcSet={article.image}
                alt={currentTitle}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent dark:from-black/80 dark:via-black/35 dark:to-transparent"></div>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-brandblue dark:bg-gray-800 dark:text-blue-300">
                    {t('category', { category: article.category })}
                  </span>
                  <span>{article.date}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('readTime', { time: article.readTime })}
                  </span>
                </div>

                <h1 className="text-4xl font-black uppercase leading-tight text-slate-950 dark:text-gray-100 md:text-5xl">
                  {currentTitle}
                </h1>

                {currentContent.excerpt && (
                  <p className="mt-5 text-base font-black leading-7 text-slate-600 dark:text-gray-300">
                    {currentContent.excerpt}
                  </p>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-gray-800">
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    sizes="64px"
                    srcSet={article.author.avatar}
                    alt={article.author.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-gray-800"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-950 dark:text-gray-100">{article.author.name}</p>
                    <p className="truncate text-sm font-black uppercase tracking-wide text-slate-400 dark:text-gray-500">{article.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-black text-slate-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {views.toLocaleString()} {t('views')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/80 sm:p-8 lg:p-10">
          <div className="prose prose-slate max-w-none dark:prose-invert">{renderedContent}</div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-b border-slate-200 py-4 dark:border-gray-800">
            <button
              onClick={() => setShowComments(!showComments)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t('comments', { count: commentsCount })}</span>
            </button>

            <div className="text-sm font-black uppercase tracking-wide text-slate-400 dark:text-gray-500">
              {t('moreLikeThis')}
            </div>
          </div>

          {showComments && (
            <div className="mt-8">
              <Comments
                productId={article.id}
                onCommentsUpdate={(count) => setCommentsCount(count)}
                commentType="blog"
              />
            </div>
          )}
        </section>

        {article.relatedArticles?.length > 0 && (
          <section className="mt-8 mb-8">
            <h3 className="mb-6 text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-gray-100">
              {t('moreLikeThis')}
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {article.relatedArticles.map((related) => {
                const relatedTitle = typeof related.title === 'string' ? related.title : (typeof related.title === 'object' && related.title ? (related.title[currentLanguage as keyof typeof related.title] || (related.title as Record<string, string>).en) : '') || '';

                return (
                  <motion.article
                    key={related.id}
                    whileHover={{ y: -4 }}
                    className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/80"
                  >
                    <Link to={`/blog/${related.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          sizes="(max-width: 768px) 100vw, 33vw"
                          srcSet={optimizeRemoteImageUrl(related.image)}
                          alt={relatedTitle}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h4 className="line-clamp-2 text-xl font-black text-slate-950 transition-colors group-hover:text-brandblue dark:text-gray-100 dark:group-hover:text-blue-300">
                          {relatedTitle}
                        </h4>

                        <div className="mt-auto pt-5 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {t('readTime', { time: related.readTime })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}
      </main>

    </div>
  );
};

export default ArticleDetail;
