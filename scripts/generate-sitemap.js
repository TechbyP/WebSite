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

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path configuration
const productsPath = path.join(__dirname, '../src/data/products.tsx');
const enJsonPath = path.join(__dirname, '../src/locales/en.json');
const deJsonPath = path.join(__dirname, '../src/locales/de.json');

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
    const enContent = fs.readFileSync(enJsonPath, 'utf-8');
    const deContent = fs.readFileSync(deJsonPath, 'utf-8');
    return {
      en: JSON.parse(enContent),
      de: JSON.parse(deContent)
    };
  } catch (err) {
    console.error('Error parsing translation files:', err);
    throw err;
  }
}

function extractTranslation(translations, key) {
  if (!key) return '';
  const translationPath = key.split('.');
  let result = translations.en;
  for (const part of translationPath) {
    result = result?.[part];
    if (!result) break;
  }
  return result || '';
}

function extractProducts(translations) {
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

      // Clean name for slug
      const cleanName = name.replace(/[^\w\s-]/g, '').trim();

      // Determine product type
      const isAccessory = cleanName.includes('Accessory') || cleanName.includes('Probe');
      const isSmartSystem = cleanName.includes('MP-');

      const product = {
        id,
        name: cleanName,
        description: shortDescription,
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

async function generateSitemap() {
  try {
    const translations = loadTranslations();
    const products = extractProducts(translations);
    
    console.log('⏳ Starting blog article fetch...');
    const blogArticles = await fetchBlogArticles();
    
    const stream = new SitemapStream({ 
      hostname: DOMAIN,
      xmlns: { 
        image: true, 
        video: true,
        news: false,
        xhtml: false,
        mobile: false
      }
    });

    // Static routes with optimized priorities
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0, lastmod: BUILD_DATE },
      { url: '/configurator', changefreq: 'weekly', priority: 0.9, lastmod: BUILD_DATE },
      { url: '/products', changefreq: 'monthly', priority: 0.8, lastmod: BUILD_DATE },
      { url: '/blog', changefreq: 'weekly', priority: 0.7, lastmod: BUILD_DATE },
      { url: '/contact', changefreq: 'yearly', priority: 0.3, lastmod: BUILD_DATE },
      { url: '/terms', changefreq: 'yearly', priority: 0.1, lastmod: BUILD_DATE }
    ];

    staticRoutes.forEach(route => stream.write(route));

    // Process products
    products.forEach(product => {
      const slug = product.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      const entry = {
        url: `/product/${slug}-${product.id}`,
        changefreq: product.changefreq,
        priority: product.priority,
        lastmod: product.lastmod,
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
      const slug = title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      const entry = {
        url: `/blog/${slug}-${article.id}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: article.date,
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