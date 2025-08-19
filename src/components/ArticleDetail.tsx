import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, MessageSquare, Printer, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Comments from '../utils/Comments';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import sanitizeHtml from 'sanitize-html';
import type { Article } from '../admin/blog/types/articles';
import { formatContentForDisplay, generateExcerpt } from '../admin/formatting';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ArticleDetail = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [views, setViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentContent = article?.content?.[currentLanguage] || article?.content?.en || { title: '', content: [], excerpt: '' };
  const currentTitle = currentContent.title || article?.title?.[currentLanguage] || article?.title?.en || '';

  const optimizeImageUrl = (url: string) =>
    url?.startsWith('http') ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1200&q=80` : url || '';

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const articleRef = doc(db, 'articles', id);
        const articleSnap = await getDoc(articleRef);

        if (!articleSnap.exists()) throw new Error(t('articleNotFound'));

        const articleData = articleSnap.data() as Article;

        await updateDoc(articleRef, { views: increment(1) }).catch(() => { });
        const updatedSnap = await getDoc(articleRef);
        setViews(updatedSnap.data()?.views || 0);

        const relatedQuery = query(collection(db, 'articles'), where('category', '==', articleData.category));
        const relatedSnapshot = await getDocs(relatedQuery);
        const relatedArticles = relatedSnapshot.docs
          .filter(doc => doc.id !== id)
          .slice(0, 3)
          .map(doc => {
            const data = doc.data() as Article;
            return { id: doc.id, title: data.title, content: data.content, image: data.image, readTime: data.readTime };
          });

        setArticle({ ...articleData, id: articleSnap.id, relatedArticles, image: optimizeImageUrl(articleData.image) });
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : t('failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, t, currentLanguage]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'comments'), where('productId', '==', id));
    const unsubscribe = onSnapshot(q, snapshot => setCommentsCount(snapshot.size));
    return () => unsubscribe();
  }, [id]);

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

const renderedContent = useMemo(() => {
  if (!currentContent?.content) return null;

  // Check if content is HTML (from RichTextEditor)
  if (typeof currentContent.content === 'string' && currentContent.content.startsWith('<')) {
    return (
      <div className="prose max-w-none text-gray-900 dark:text-gray-100 dark:prose-invert">
        <div
          className="first-paragraph-with-dropcap"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(currentContent.content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt', 'title', 'width', 'height', 'class']
              }
            })
          }}
        />
      </div>
    );
  }

  // Handle array content (markdown or plain text)
  const contentArray = Array.isArray(currentContent.content)
    ? currentContent.content
    : [currentContent.content];

  return (
    <div className="prose max-w-none text-gray-900 dark:text-gray-100 dark:prose-invert">
      {contentArray.map((paragraph, index) => (
        <div key={index} className={index === 0 ? "first-paragraph-with-dropcap" : ""}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
              a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 dark:text-gray-100" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 dark:text-gray-100" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 dark:text-gray-100" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />,
              code: ({ node, inline, className, children, ...props }) =>
                inline ? (
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto my-4 text-sm font-mono" {...props}>
                    <code>{children}</code>
                  </pre>
                ),
              table: ({ node, ...props }) => <table className="table-auto border-collapse border border-gray-300 dark:border-gray-600 w-full my-4" {...props} />,
              th: ({ node, ...props }) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-left" {...props} />,
              td: ({ node, ...props }) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1" {...props} />,
            }}
          >
            {paragraph}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}, [currentContent.content]);


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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{`${currentTitle} | TECHBYP Blog`}</title>
        <meta name="description" content={currentContent.excerpt || generateExcerpt(currentContent.content)} />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <header
        className={`sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('backToArticles')}
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                aria-label={t('share')}
              >
                <Share2 className="h-5 w-5" />
              </button>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20"
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
            <button onClick={handlePrint} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors" aria-label={t('print')}>
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

     <main className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
  <div className="mb-12">
    <div className="flex items-center space-x-3 mb-6">
      <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full uppercase">
        {t('category', { category: article.category })}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {t('readTime', { time: article.readTime })}
      </span>
    </div>

    <h1 className="text-4xl md:text-5xl font-bold uppercase mb-6">
      {currentTitle}
    </h1>

    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <img
          sizes="(max-width: 768px) 50vw, 25vw"
          srcSet={article.author.avatar}
          alt={article.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-black">{article.author.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{article.author.role}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{article.date}</p>
    </div>

    <div className="relative rounded-xl overflow-hidden mb-8 h-96">
      <img
        sizes="(max-width: 768px) 50vw, 25vw"
        srcSet={article.image}
        alt={currentTitle}
        className="w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent dark:from-black/80 dark:via-black/50 dark:to-transparent"></div>
    </div>
  </div>

  {renderedContent}

  <div className="flex justify-between items-center border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-8">
    <button
      onClick={() => setShowComments(!showComments)}
      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <MessageSquare className="h-6 w-6" />
      <span>{t('comments', { count: commentsCount })}</span>
    </button>
    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
      <Eye className="h-5 w-5" />
      <span>{views.toLocaleString()} {t('views')}</span>
    </div>
  </div>

  {showComments && (
    <div className="mb-16">
      <Comments
        productId={article.id}
        onCommentsUpdate={(count) => setCommentsCount(count)}
        commentType="blog"
      />
    </div>
  )}

  {article.relatedArticles?.length > 0 && (
    <div className="mb-16">
      <h3 className="text-2xl font-bold mb-6">{t('moreLikeThis')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {article.relatedArticles.map((related) => {
          const relatedContent = related.content?.[currentLanguage] || related.content?.en || {};
          const relatedTitle = relatedContent.title || related.title?.[currentLanguage] || related.title?.en || '';

          return (
            <motion.article
              key={related.id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/blog/${related.id}`)}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-shadow"
            >
              <div className="relative h-40">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
                  srcSet={optimizeImageUrl(related.image)}
                  alt={relatedTitle}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                  {relatedTitle}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('readTime', { time: related.readTime })}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  )}
</main>

    </div>
  );
};

export default ArticleDetail;
