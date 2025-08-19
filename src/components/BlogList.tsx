import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, Bookmark } from 'lucide-react';
import { motion, useAnimation, AnimatePresence, useInView } from 'framer-motion';
import blog from '../assets/pictures/blog.jpg';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface ArticleContent {
  content: string[];
  excerpt: string;
}

interface Article {
  id: string;
  title: { [key: string]: string };
  content: { [key: string]: ArticleContent };
  author: Author;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  trending?: boolean;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    if (media.matches !== matches) setMatches(media.matches);
    return () => media.removeListener(listener);
  }, [matches, query]);
  return matches;
};

const FadeInWhenVisible = React.memo(({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => { if (inView) controls.start('visible'); }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      {children}
    </motion.div>
  );
});

const BlogList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getLocalizedContent = (article: Article) => {
    const lang = i18n.language;
    return {
      title: article.title[lang] || article.title.en,
      excerpt: article.content[lang]?.excerpt || article.content.en.excerpt,
      content: article.content[lang]?.content || article.content.en.content
    };
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const articlesData: Article[] = [];
        snapshot.forEach(doc => articlesData.push({ ...doc.data() as Article, id: doc.id }));
        setArticles(articlesData);
        setFilteredArticles(articlesData);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    let results = articles;
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      results = results.filter(article => {
        const localized = getLocalizedContent(article);
        return localized.title.toLowerCase().includes(queryLower) || localized.excerpt.toLowerCase().includes(queryLower);
      });
    }
    if (activeCategory !== 'all') results = results.filter(a => a.category === activeCategory);
    setFilteredArticles(results);
  }, [searchQuery, activeCategory, articles, i18n.language]);

  const categories = ['all', ...new Set(articles.map(a => a.category))];

  const MobileArticleCard = ({ article }: { article: Article }) => {
    const [expanded, setExpanded] = useState(false);
    const localized = getLocalizedContent(article);
    return (
      <motion.div
        key={article.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(`/blog/${article.id}`)}
        className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-full"
      >
        <div className="flex flex-row">
          <div className="w-1/3 relative">
            <img srcSet={article.image} alt={localized.title} className="w-full h-full object-cover" loading="lazy" />
            {article.featured && <div className="absolute top-2 left-2 bg-brandgreen text-white px-2 py-0.5 rounded-full text-xs font-black">{t('blog.labels.featured')}</div>}
            {article.trending && <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm text-xs font-black px-2 py-0.5 rounded-full">{t('blog.labels.trending')}</div>}
          </div>
          <div className="w-2/3 p-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black text-brandblue dark:text-blue-300">{article.category.toUpperCase()}</span>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 line-clamp-2">{localized.title}</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center font-black"><Clock className="h-3 w-3 mr-1" />{article.readTime}</span>
            </div>
            <div className="mt-1">
              <p className={`text-gray-600 dark:text-gray-300 text-xs ${expanded ? '' : 'line-clamp-2'}`} onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}>{localized.excerpt}</p>
              {localized.excerpt.length > 100 && (
                <button className="text-xs text-brandblue dark:text-blue-300 mt-1" onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}>
                  {expanded ? t('blog.buttons.showLess') : t('blog.buttons.readMore')}
                </button>
              )}
            </div>
            <div className="mt-auto pt-2 flex justify-between items-center">
              <button onClick={e => { e.stopPropagation(); navigate(`/blog/${article.id}`); }} className="text-xs font-black text-brandblue dark:text-blue-300 flex items-center">
                {t('blog.buttons.readMore')} <ArrowRight className="h-3 w-3 ml-1" />
              </button>
              <button className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={e => e.stopPropagation()}>
                <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Helmet>
        <title>{t('blog.meta.title')}</title>
        <meta name="description" content={t('blog.meta.description')} />
      </Helmet>

      {/* Header */}
      <header className="relative py-5 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${blog})`, filter: 'brightness(0.6)' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase">{t('blog.headings.insightsHub')}</h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl font-black">{t('blog.headings.tagline')}</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder={t('blog.placeholders.search')}
                  className="w-full bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-full py-4 px-6 pr-12 text-gray-900 dark:text-gray-100 placeholder-blue-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <button className="p-2 rounded-full bg-brandgreen hover:bg-green-800"><Search className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex flex-wrap gap-2 pb-2">
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-black transition-colors ${activeCategory === category
                  ? 'bg-brandgreen text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-brandgreen dark:hover:text-blue-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'all' ? t('blog.categories.all') : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {filteredArticles.some(a => a.featured) && (
          <FadeInWhenVisible>
            <section className="mb-16">
              <h2 className="text-3xl md:text-4xl font-black leading-tight text-gray-900 dark:text-gray-100 mb-6 uppercase">{t('blog.sections.featuredStory')}</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
                {filteredArticles.filter(a => a.featured).map(article => {
                  const localized = getLocalizedContent(article);
                  return (
                    <div key={article.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="relative h-64 lg:h-full">
                        <img srcSet={article.image} alt={localized.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute bottom-4 left-4 bg-brandgreen text-white px-3 py-1 rounded-full text-sm font-black">{t('blog.labels.featured')}</div>
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-sm font-black text-brandblue dark:text-blue-300">{article.category.toUpperCase()}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center font-black"><Clock className="h-4 w-4 mr-1" />{article.readTime}</span>
                        </div>
                        <h3 className="text-3xl font-black mb-4">{localized.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 font-black">{localized.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <button onClick={() => navigate(`/blog/${article.id}`)} className="flex items-center text-brandblue dark:text-blue-300 font-black group">{t('blog.buttons.digDeeper')} <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></button>
                          <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"><Bookmark className="h-5 w-5 text-gray-600 dark:text-gray-300" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeInWhenVisible>
        )}

        {/* Trending Articles */}
        {filteredArticles.some(a => a.trending) && (
          <FadeInWhenVisible>
            <section className="mb-16">
              <h2 className="text-3xl md:text-4xl font-black leading-tight text-gray-900 dark:text-gray-100 mb-6 uppercase">{t('blog.sections.trendingNow')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredArticles.filter(a => a.trending).map(article => {
                    const localized = getLocalizedContent(article);
                    return isMobile ? <MobileArticleCard key={article.id} article={article} /> : (
                      <article key={article.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-48">
                          <img srcSet={article.image} alt={localized.title} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm text-xs font-black px-2 py-1 rounded-full">{t('blog.labels.trending')}</div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xs font-black text-brandblue dark:text-blue-300">{article.category.toUpperCase()}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center font-black"><Clock className="h-3 w-3 mr-1" />{article.readTime}</span>
                          </div>
                          <h3 className="text-xl font-black mb-3 line-clamp-2">{localized.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 font-black">{localized.excerpt}</p>
                          <button onClick={() => navigate(`/blog/${article.id}`)} className="text-sm font-black text-brandblue dark:text-blue-300 hover:text-blue-800 transition-colors">{t('blog.buttons.readMore')}</button>
                        </div>
                      </article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>
          </FadeInWhenVisible>
        )}

        {/* Latest Articles */}
        <FadeInWhenVisible>
          <section>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-gray-900 dark:text-gray-100 mb-6 uppercase">{t('blog.sections.latestArticles')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map(article => {
                  const localized = getLocalizedContent(article);
                  return isMobile ? <MobileArticleCard key={article.id} article={article} /> : (
                    <article key={article.id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img srcSet={article.image} alt={localized.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-xs font-black text-brandblue dark:text-blue-300">{article.category.toUpperCase()}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center font-black"><Clock className="h-3 w-3 mr-1" />{article.readTime}</span>
                        </div>
                        <h3 className="text-xl font-black mb-2 line-clamp-2">{localized.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 font-black">{localized.excerpt}</p>
                        <button onClick={() => navigate(`/blog/${article.id}`)} className="mt-3 text-sm font-black text-brandblue dark:text-blue-300 hover:text-blue-800 transition-colors">{t('blog.buttons.readMore')}</button>
                      </div>
                    </article>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </FadeInWhenVisible>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-24 text-gray-700 dark:text-gray-300">
            <p>{t('blog.emptyResults')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogList;
