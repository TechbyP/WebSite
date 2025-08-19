import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

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
      // const heroDescKey = cleanBlock.match(/herodescription\s*:\s*t\(['"](.*?)['"]\)/)?.[1];
      const descKey = cleanBlock.match(/description\s*:\s*t\(['"](.*?)['"]\)/)?.[1];

      // Resolve translations
      const name = directName || extractTranslation(translations, nameKey) || `Product ${id}`;
      // const heroDescription = extractTranslation(translations, heroDescKey);
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

async function generateSitemap() {
  try {
    const translations = loadTranslations();
    const products = extractProducts(translations);
    const stream = new SitemapStream({ 
      hostname: DOMAIN,
      xmlns: { 
        image: true, 
        video: true,
        news: false,
        xhtml: false,
        mobile: false,
        image: {
          image: true
        },
        video: {
          video: true
        }
      }
    });

    // Static routes with optimized priorities
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0, lastmod: BUILD_DATE },
      { url: '/configurator', changefreq: 'weekly', priority: 0.9, lastmod: BUILD_DATE },
      { url: '/products', changefreq: 'monthly', priority: 0.8, lastmod: BUILD_DATE },
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

    stream.end();

    const sitemap = (await streamToPromise(Readable.from(stream)))
      .toString()
      .replace(/<\/url>\s*<\/url>/g, '</url>');

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);

    console.log(`✅ Sitemap generated with:
- ${staticRoutes.length} static URLs
- ${products.length} product URLs
- ${products.filter(p => p.imageUrl !== DEFAULT_IMAGE).length} custom images
- ${products.filter(p => p.videoId).length} videos`);

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  }
}

generateSitemap();