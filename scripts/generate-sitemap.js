import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configuration
const DOMAIN = 'https://www.techbyp.com';
const BUILD_DATE = new Date().toISOString();
const DEFAULT_IMAGE = `${DOMAIN}/assets/default-product-image.jpg`;
const LICENSE_URL = `${DOMAIN}/license`;
const COMPANY_LOCATION = 'Germany';
const DEFAULT_LOCALE = 'en';
const LOCALE_QUERY_PARAM = 'lng';

function buildLocalizedPath(pathname, localeCode) {
  const url = new URL(pathname, DOMAIN);

  if (localeCode === DEFAULT_LOCALE) {
    url.searchParams.delete(LOCALE_QUERY_PARAM);
  } else {
    url.searchParams.set(LOCALE_QUERY_PARAM, localeCode);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function buildAlternateLinks(pathname, localeCodes) {
  const links = localeCodes.map((localeCode) => ({
    lang: localeCode,
    url: buildLocalizedPath(pathname, localeCode),
  }));

  links.push({
    lang: 'x-default',
    url: buildLocalizedPath(pathname, DEFAULT_LOCALE),
  });

  return links;
}

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path configuration
const productsPath = path.join(__dirname, '../src/data/products.tsx');
const localesDirPath = path.join(__dirname, '../src/locales');
const publicContentPath = path.join(__dirname, '../public/content');
const productsFeedPath = path.join(publicContentPath, 'products.json');
const blogIndexFeedPath = path.join(publicContentPath, 'blog-index.json');
const faqFeedPath = path.join(publicContentPath, 'faq.json');
const aiManifestFeedPath = path.join(publicContentPath, 'ai-manifest.json');

// Global variables
let db = null;
let firestoreHelpers = null;

const FIREBASE_TIMEOUT = 10000; // 10 seconds

async function initializeFirebase() {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firebase initialization timeout')), FIREBASE_TIMEOUT);
    });

    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };

    const app = await Promise.race([initializeApp(firebaseConfig), timeoutPromise]);
    const firestoreDb = getFirestore(app);
    firestoreHelpers = { collection, getDocs, query, orderBy };
    console.log('✅ Firebase initialized successfully');
    return firestoreDb;
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
    return null;
  }
}

function loadTranslations() {
  try {
    const localeFiles = fs
      .readdirSync(localesDirPath)
      .filter((fileName) => fileName.endsWith('.json'));

    if (localeFiles.length === 0) {
      throw new Error('No locale files found.');
    }

    const translations = {};

    localeFiles.forEach((fileName) => {
      const localeCode = path.basename(fileName, '.json');
      const localePath = path.join(localesDirPath, fileName);
      const localeContent = fs.readFileSync(localePath, 'utf-8');
      translations[localeCode] = JSON.parse(localeContent);
    });

    return translations;
  } catch (err) {
    console.error('Error parsing translation files:', err);
    throw err;
  }
}

function extractTranslation(translations, key, localeCode = 'en') {
  if (!key) return '';
  const translationPath = key.split('.');
  let result = translations[localeCode] || translations.en;
  for (const part of translationPath) {
    result = result?.[part];
    if (!result) break;
  }
  return result || '';
}

function stripHtml(value = '') {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTextContent(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string').join(' ');
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function extractProducts(translations) {
  const localeCodes = Object.keys(translations);
  const content = fs.readFileSync(productsPath, 'utf-8');
  
  // Find the products array
  const arrayStart = content.indexOf('return [');
  if (arrayStart === -1) throw new Error('Could not locate products array');
  
  let arrayContent = content.slice(arrayStart + 'return ['.length);
  const arrayEnd = arrayContent.indexOf('];');
  if (arrayEnd === -1) throw new Error('Could not locate products array end');
  arrayContent = arrayContent.slice(0, arrayEnd);

  // Parse product blocks
  const productBlocks = [];
  let currentBlock = '';
  let braceLevel = 0;
  let inString = false;
  let inProduct = false;
  let escapeNext = false;

  for (const char of arrayContent) {
    if (escapeNext) {
      currentBlock += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      currentBlock += char;
      escapeNext = true;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      if (!inString) inString = char;
      else if (inString === char) inString = false;
    }

    if (!inString) {
      if (char === '{' && !inProduct) {
        inProduct = true;
        braceLevel = 1;
        currentBlock = char;
        continue;
      }

      if (inProduct) {
        currentBlock += char;
        if (char === '{') braceLevel++;
        if (char === '}') braceLevel--;
        
        if (braceLevel === 0) {
          productBlocks.push(currentBlock);
          currentBlock = '';
          inProduct = false;
        }
      }
    } else if (inProduct) {
      currentBlock += char;
    }
  }

  const products = [];

  for (const block of productBlocks) {
    try {
      const cleanBlock = block
        .replace(/\/\/.*$/gm, '')
        .replace(/,\s*$/, '');

      const getProp = (propName) => {
        const regex = new RegExp(`${propName}\\s*:\\s*(["'\`])(.*?)\\1|${propName}\\s*:\\s*([^,\\s}]+)`);
        const match = cleanBlock.match(regex);
        return match ? (match[2] || match[3]) : null;
      };

      const id = getProp('id');
      if (!id) continue;

      // Extract basic properties
      const image = getProp('image');
      const heroVideo = getProp('heroVideo');
      const bestseller = cleanBlock.includes('bestseller: true');

      // Extract names and descriptions
      const directName = cleanBlock.match(/name\s*:\s*(["'`])(.*?)\1/)?.[2];
      const nameKey = cleanBlock.match(/name\s*:\s*t\(['"](.*?)['"]\)/)?.[1];
      const descKey = cleanBlock.match(/description\s*:\s*t\(['"](.*?)['"]\)/)?.[1];

      // Resolve translations
      const name = directName || extractTranslation(translations, nameKey) || `Product ${id}`;
      const description = extractTranslation(translations, descKey);
      const shortDescription =  description || '';

      const localizations = {};

      localeCodes.forEach((localeCode) => {
        const localizedName = directName || extractTranslation(translations, nameKey, localeCode);
        const localizedDescription = stripHtml(extractTranslation(translations, descKey, localeCode));

        if (localizedName || localizedDescription) {
          localizations[localeCode] = {
            name: localizedName || '',
            description: localizedDescription || '',
          };
        }
      });

      // Clean name for slug
      const cleanName = name.replace(/[^\w\s-]/g, '').trim();

      // Determine product type
      const isAccessory = cleanName.includes('Accessory') || cleanName.includes('Probe');
      const isSmartSystem = cleanName.includes('MP-');

      const product = {
        id,
        name: cleanName,
        description: shortDescription,
        localizations,
        available_locales: Object.keys(localizations),
        imagePath: image ? image.replace(/["'`]/g, '').split('?')[0] : null,
        videoId: heroVideo || null,
        lastmod: BUILD_DATE,
        priority: bestseller ? 0.6 : (isAccessory ? 0.3 : 0.4),
        changefreq: isSmartSystem ? 'yearly' : 'monthly',
        isAccessory,
        isSmartSystem
      };

      // Handle image URL
      if (product.imagePath && !product.imagePath.includes('undefined')) {
        product.imageUrl = `${DOMAIN}/assets/${
          product.imagePath.includes('.')
            ? product.imagePath.replace(/^\.\.\/assets\//, '')
            : `${product.imagePath.replace(/^\.\.\/assets\//, '')}.jpg`
        }`;
      } else {
        product.imageUrl = DEFAULT_IMAGE;
      }

      products.push(product);
    } catch (err) {
      console.error('Error processing product block:', err.message);
      console.log('Problematic block:', block.substring(0, 200));
    }
  }

  return products;
}

async function fetchBlogArticles() {
  const BLOG_CACHE_PATH = path.join(__dirname, '.blog-cache.json');
  const FETCH_TIMEOUT = 8000; // 8 seconds timeout

  // Try to load from cache first for faster builds
  if (fs.existsSync(BLOG_CACHE_PATH)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(BLOG_CACHE_PATH, 'utf-8'));
      const cacheAge = Date.now() - (cachedData.timestamp || 0);
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      // Use cache if it's less than 24 hours old
      if (cacheAge < MAX_CACHE_AGE) {
        console.log('📚 Using cached blog articles (fresh)');
        return cachedData.articles;
      }
      console.log('📚 Cache exists but is stale, fetching fresh data...');
    } catch (e) {
      console.warn('⚠️ Failed to load cached blog articles:', e.message);
    }
  }

  try {
    if (!firestoreHelpers) {
      return [];
    }

    const { collection, getDocs, query, orderBy } = firestoreHelpers;
    const articlesCollection = collection(db, 'articles');
    const q = query(articlesCollection, orderBy('date', 'desc'));
    
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Firebase fetch timed out after ${FETCH_TIMEOUT}ms`)), FETCH_TIMEOUT);
    });

    console.log('⏳ Fetching blog articles from Firebase...');
    
    // Race between the Firebase query and the timeout
    const querySnapshot = await Promise.race([getDocs(q), timeoutPromise]);
    const articles = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      const article = {
        id: doc.id,
        content: {
          en: data.content?.en || { title: '', content: [''], excerpt: '' },
          de: data.content?.de || { title: '', content: [''], excerpt: '' }
        },
        author: data.author || { 
          name: 'TechByP', 
          role: 'Director of Deep Thoughts & Deeper Holes', 
          avatar: '' 
        },
        date: data.date || new Date().toISOString(),
        readTime: data.readTime || '3 min',
        category: data.category || 'technology',
        image: data.image || '',
        relatedArticles: data.relatedArticles || []
      };

      articles.push(article);
    });

    // Cache the successful results
    try {
      const cacheData = {
        timestamp: Date.now(),
        articles: articles
      };
      fs.writeFileSync(BLOG_CACHE_PATH, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Blog articles cached (${articles.length} articles)`);
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache blog articles:', cacheError.message);
    }

    return articles;

  } catch (error) {
    console.warn('⚠️ Blog article fetch failed:', error.message);
    
    // Fall back to cache if available, even if stale
    if (fs.existsSync(BLOG_CACHE_PATH)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(BLOG_CACHE_PATH, 'utf-8'));
        console.log('🔄 Falling back to cached blog articles');
        return cachedData.articles || [];
      } catch (e) {
        console.warn('⚠️ Failed to load cached blog articles as fallback:', e.message);
      }
    }
    
    return [];
  }
}

function buildFaqItems(translations) {
  const localeCodes = Object.keys(translations);
  const englishFaq = translations.en?.contact_page?.faq || {};

  return Object.entries(englishFaq)
    .filter(([key, value]) => key !== 'title' && value && typeof value === 'object')
    .map(([key, value]) => {
      const englishValue = value || {};
      const localizations = {};

      localeCodes.forEach((localeCode) => {
        const localizedEntry = translations[localeCode]?.contact_page?.faq?.[key];
        const localizedQuestion = localizedEntry?.question || '';
        const localizedAnswer = localizedEntry?.answer || '';

        if (localizedQuestion || localizedAnswer) {
          localizations[localeCode] = {
            question: localizedQuestion,
            answer: localizedAnswer,
          };
        }
      });

      const germanValue = localizations.de || {};

      return {
        id: key,
        question: englishValue.question || '',
        answer: englishValue.answer || '',
        question_de: germanValue.question || '',
        answer_de: germanValue.answer || '',
        localizations,
        available_locales: Object.keys(localizations),
        source_url: `${DOMAIN}/contact`,
      };
    });
}

function generateGaioFeeds(translations, products, blogArticles) {
  fs.mkdirSync(publicContentPath, { recursive: true });

  const productsFeed = {
    version: '1.0',
    updatedAt: BUILD_DATE,
    source: 'prebuild-script',
    canonical: `${DOMAIN}/content/products.json`,
    items: products.map((product) => ({
      id: String(product.id),
      name: product.name,
      description: product.description,
      localizations: product.localizations || {},
      available_locales: product.available_locales || [],
      url: `${DOMAIN}/product/${product.id}`,
      image: product.imageUrl,
      category: product.isAccessory ? 'accessory' : 'sampling-equipment',
      product_type: product.isSmartSystem ? 'smart-system' : 'equipment',
      has_video: Boolean(product.videoId),
      video_url: product.videoId
        ? (product.videoId.length === 11 && !product.videoId.includes('/')
          ? `https://www.youtube.com/watch?v=${product.videoId}`
          : `${DOMAIN}/videos/${product.videoId.replace(/\.\w+$/, '')}.mp4`)
        : null,
      last_updated: product.lastmod,
    })),
  };

  const blogIndexFeed = {
    version: '1.0',
    updatedAt: BUILD_DATE,
    source: 'prebuild-script',
    canonical: `${DOMAIN}/content/blog-index.json`,
    items: blogArticles.map((article) => {
      const titleEn = article.content?.en?.title || '';
      const titleDe = article.content?.de?.title || '';
      const excerptEn = article.content?.en?.excerpt || stripHtml(normalizeTextContent(article.content?.en?.content)).slice(0, 320);
      const excerptDe = article.content?.de?.excerpt || stripHtml(normalizeTextContent(article.content?.de?.content)).slice(0, 320);
      const articleLocales = Object.keys(article.content || {});
      const localizations = {};

      articleLocales.forEach((localeCode) => {
        const localizedContent = article.content?.[localeCode] || {};
        const localizedTitle = localizedContent.title || article.title?.[localeCode] || '';
        const localizedSummary = localizedContent.excerpt || stripHtml(normalizeTextContent(localizedContent.content)).slice(0, 320);

        if (localizedTitle || localizedSummary) {
          localizations[localeCode] = {
            title: localizedTitle,
            summary: localizedSummary,
          };
        }
      });

      return {
        id: String(article.id),
        url: `${DOMAIN}/blog/${article.id}`,
        category: article.category || 'technology',
        published_at: article.date || BUILD_DATE,
        read_time: article.readTime || '',
        image: article.image || '',
        author: {
          name: article.author?.name || 'TechByP',
          role: article.author?.role || '',
        },
        title: {
          en: titleEn,
          de: titleDe,
        },
        summary: {
          en: excerptEn,
          de: excerptDe,
        },
        localizations,
        available_locales: Object.keys(localizations),
      };
    }),
  };

  const faqFeed = {
    version: '1.0',
    updatedAt: BUILD_DATE,
    source: 'translations-multilingual',
    canonical: `${DOMAIN}/content/faq.json`,
    locales: Object.keys(translations),
    items: buildFaqItems(translations),
  };

  const aiManifest = {
    version: '1.0',
    updatedAt: BUILD_DATE,
    site: DOMAIN,
    feeds: {
      products: '/content/products.json',
      blogIndex: '/content/blog-index.json',
      faq: '/content/faq.json',
      announcements: '/content/announcements.json',
      heroItems: '/content/hero-items.json',
    },
    llms: '/llms.txt',
    policy: '/ai.txt',
    telemetry: '/api/ai-signals',
  };

  fs.writeFileSync(productsFeedPath, JSON.stringify(productsFeed, null, 2));
  fs.writeFileSync(blogIndexFeedPath, JSON.stringify(blogIndexFeed, null, 2));
  fs.writeFileSync(faqFeedPath, JSON.stringify(faqFeed, null, 2));
  fs.writeFileSync(aiManifestFeedPath, JSON.stringify(aiManifest, null, 2));

  console.log(`✅ GAIO feeds generated:\n- ${productsFeed.items.length} products\n- ${blogIndexFeed.items.length} blog entries\n- ${faqFeed.items.length} FAQ entries`);
}

async function generateSitemap() {
  try {
    const translations = loadTranslations();
    const localeCodes = Object.keys(translations);
    const products = extractProducts(translations);
    
    console.log('⏳ Starting blog article fetch...');
    const blogArticles = await fetchBlogArticles();
    
    const stream = new SitemapStream({ 
      hostname: DOMAIN,
      xmlns: { 
        image: true, 
        video: true,
        news: false,
        xhtml: true,
        mobile: false
      }
    });

    // Static routes with optimized priorities
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0, lastmod: BUILD_DATE },
      { url: '/configurator', changefreq: 'weekly', priority: 0.9, lastmod: BUILD_DATE },
      { url: '/blog', changefreq: 'weekly', priority: 0.7, lastmod: BUILD_DATE },
      { url: '/downloads', changefreq: 'weekly', priority: 0.7, lastmod: BUILD_DATE },
      { url: '/contact', changefreq: 'yearly', priority: 0.3, lastmod: BUILD_DATE },
      { url: '/privacy', changefreq: 'yearly', priority: 0.2, lastmod: BUILD_DATE },
      { url: '/imprint', changefreq: 'yearly', priority: 0.2, lastmod: BUILD_DATE },
      { url: '/terms', changefreq: 'yearly', priority: 0.1, lastmod: BUILD_DATE }
    ];

    staticRoutes.forEach((route) => {
      stream.write({
        ...route,
        links: buildAlternateLinks(route.url, localeCodes),
      });
    });

    // Process products
    products.forEach(product => {
      const entry = {
        url: `/product/${product.id}`,
        changefreq: product.changefreq,
        priority: product.priority,
        lastmod: product.lastmod,
        links: buildAlternateLinks(`/product/${product.id}`, localeCodes),
        img: [{
          url: product.imageUrl,
          caption: `${product.name}: ${product.description.substring(0, 120)}...`,
          title: product.name,
          geo_location: COMPANY_LOCATION,
          license: LICENSE_URL
        }]
      };

      if (product.videoId) {
        const isYouTube = product.videoId.length === 11 && !product.videoId.includes('/');
        
        entry.video = [{
          thumbnail_loc: product.imageUrl,
          title: `${product.name} Demonstration`,
          description: product.description || `Video showing features of ${product.name}`,
          family_friendly: 'yes',
          duration: product.isSmartSystem ? 180 : 90,
          live: 'no',
          requires_subscription: 'no',
          upload_date: product.lastmod.split('T')[0],
          tags: product.isSmartSystem ? 
            ['sampling', 'technology', 'automation'] : 
            ['accessory', 'tool', 'measurement']
        }];

        if (isYouTube) {
          entry.video[0].player_loc = `https://www.youtube.com/embed/${product.videoId}`;
        } else {
          entry.video[0].content_loc = `${DOMAIN}/videos/${product.videoId.replace(/\.\w+$/, '')}.mp4`;
        }
      }

      stream.write(entry);
    });

    // Process blog articles
    blogArticles.forEach(article => {
      const title = article.content.en.title || article.content.de.title || 'Untitled';

      const entry = {
        url: `/blog/${article.id}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: article.date,
        links: buildAlternateLinks(`/blog/${article.id}`, localeCodes),
        img: article.image ? [{
          url: article.image,
          caption: `${title}: ${article.content.en.excerpt || article.content.de.excerpt || ''}`.substring(0, 120),
          title: title,
          geo_location: COMPANY_LOCATION,
          license: LICENSE_URL
        }] : []
      };

      stream.write(entry);
    });

    stream.end();

    const sitemap = (await streamToPromise(Readable.from(stream)))
      .toString()
      .replace(/<\/url>\s*<\/url>/g, '</url>');

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    generateGaioFeeds(translations, products, blogArticles);

    console.log(`✅ Sitemap generated with:
- ${staticRoutes.length} static URLs
- ${products.length} product URLs
- ${blogArticles.length} blog article URLs
- ${products.filter(p => p.imageUrl !== DEFAULT_IMAGE).length} custom images
- ${products.filter(p => p.videoId).length} videos`);

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  }
}

// Check if Firebase environment variables are set
if (!process.env.VITE_FIREBASE_API_KEY) {
  console.error('❌ Firebase environment variables are not set. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.');
  process.exit(1);
}

generateSitemap();