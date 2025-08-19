import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

// Configuration
const DOMAIN = 'https://www.techbyp.com';
const BUILD_DATE = new Date().toISOString();

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your products.tsx file
const productsPath = path.join(__dirname, '../src/data/products.tsx');
// Path to your localization files
const enJsonPath = path.join(__dirname, '../src/locales/en.json');
const deJsonPath = path.join(__dirname, '../src/locales/de.json');

function loadTranslations() {
  const enContent = fs.readFileSync(enJsonPath, 'utf-8');
  const deContent = fs.readFileSync(deJsonPath, 'utf-8');
  
  try {
    const enTranslations = JSON.parse(enContent);
    const deTranslations = JSON.parse(deContent);
    return { en: enTranslations, de: deTranslations };
  } catch (err) {
    console.error('Error parsing translation files:', err);
    throw err;
  }
}

function extractProducts(translations) {
  const content = fs.readFileSync(productsPath, 'utf-8');
  
  // Find the products array more reliably
  const arrayStart = content.indexOf('return [');
  if (arrayStart === -1) {
    console.error('Failed to find products array start');
    throw new Error('Could not locate products array');
  }

  let arrayContent = content.slice(arrayStart + 'return ['.length);
  const arrayEnd = arrayContent.indexOf('];');
  if (arrayEnd === -1) {
    console.error('Failed to find products array end');
    throw new Error('Could not locate products array end');
  }
  arrayContent = arrayContent.slice(0, arrayEnd);

  // Improved product block extraction
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
      if (!inString) {
        inString = char;
      } else if (inString === char) {
        inString = false;
      }
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
          continue;
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
        .replace(/\/\/.*$/gm, '') // remove single-line comments
        .replace(/,\s*$/, '');    // remove trailing commas

      const getProp = (propName) => {
        const regex = new RegExp(`${propName}\\s*:\\s*(["'\`])(.*?)\\1|${propName}\\s*:\\s*([^,\\s}]+)`);
        const match = cleanBlock.match(regex);
        return match ? (match[2] || match[3]) : null;
      };

      const id = getProp('id');
      const image = getProp('image');
      const heroVideo = getProp('heroVideo');
      const date = getProp('date');
      const bestseller = cleanBlock.includes('bestseller: true');

      // Matches: name: "Some Name"
      const directMatch = cleanBlock.match(/name\s*:\s*(["'`])(.*?)\1/);
      const directName = directMatch ? directMatch[2] : null;

      // Matches: name: t("some.translation.key")
      const tMatch = cleanBlock.match(/name\s*:\s*t\(['"](.*?)['"]\)/);
      const nameKey = tMatch ? tMatch[1] : null;

      if (id) {
        let name;

        if (directName) {
          // Always prefer explicit string name
          name = directName;
        } else if (nameKey) {
          // Resolve from translations if no direct string
          const translationPath = nameKey.split('.');
          let translation = translations.en;
          for (const part of translationPath) {
            translation = translation?.[part];
            if (!translation) break;
          }
          if (!translation) {
            translation = translations.de;
            for (const part of translationPath) {
              translation = translation?.[part];
              if (!translation) break;
            }
          }
          name = translation || `Product ${id}`;
        } else {
          name = `Product ${id}`;
        }

        // Clean name for slug
        const cleanName = name.replace(/[^\w\s-]/g, '').trim();

        const product = {
          id,
          name: cleanName,
          imagePath: image ? image.replace(/["'`]/g, '').split('?')[0] : null,
          videoId: heroVideo || null,
          lastmod: date ? new Date(parseInt(date)).toISOString() : new Date().toISOString(),
          priority: bestseller ? 0.9 : 0.7,
          changefreq: bestseller ? 'weekly' : 'monthly'
        };

        if (product.imagePath && !product.imagePath.includes('undefined')) {
          product.imageUrl = `${DOMAIN}/assets/${
            product.imagePath.includes('.')
              ? product.imagePath.replace(/^\.\.\/assets\//, '')
              : `${product.imagePath.replace(/^\.\.\/assets\//, '')}.jpg`
          }`;
        } else {
          product.imageUrl = null;
        }

        products.push(product);
      }
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
      xmlns: { image: true, video: true }
    });

    // Static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0, lastmod: BUILD_DATE },
      { url: '/contact', changefreq: 'monthly', priority: 0.5, lastmod: BUILD_DATE },
      { url: '/configurator', changefreq: 'weekly', priority: 0.8, lastmod: BUILD_DATE }
    ];
    staticRoutes.forEach(route => stream.write(route));

    // Product routes
    products.forEach(product => {
      // Create a more SEO-friendly slug
      const slug = product.name.toLowerCase()
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w-]+/g, '')      // Remove all non-word chars
        .replace(/--+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')           // Trim - from start of text
        .replace(/-+$/, '');          // Trim - from end of text

      const entry = {
        url: `/product/${slug}-${product.id}`,
        changefreq: product.changefreq,
        priority: product.priority,
        lastmod: product.lastmod
      };

      if (product.imageUrl) {
        entry.img = [{
          url: product.imageUrl,
          caption: product.name,
          title: product.name
        }];
      }

      if (product.videoId) {
        entry.video = [{
          thumbnail_loc: product.imageUrl || `${DOMAIN}/assets/default-thumbnail.jpg`,
          title: product.name,
          description: `Video demonstration of ${product.name}`,
          content_loc: product.videoId.includes('youtube') 
            ? `https://www.youtube.com/watch?v=${product.videoId}`
            : `${DOMAIN}/videos/${product.videoId}`,
          family_friendly: 'yes',
          duration: product.name.includes('MP-') ? 180 : 120,
          live: 'no',
          requires_subscription: 'no',
          upload_date: product.lastmod.split('T')[0] // YYYY-MM-DD
        }];
      }

      stream.write(entry);
    });

    stream.end();

    const sitemap = (await streamToPromise(Readable.from(stream)))
      .toString()
      .replace(/<\/url>\s*<\/url>/g, '</url>'); // fix duplicate closing tags

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);

    console.log(`✅ Sitemap generated:
- ${products.length} product URLs
- ${products.filter(p => p.imageUrl).length} images
- ${products.filter(p => p.videoId).length} videos`);

    // Log all product URLs for verification
    console.log('\nAll product URLs:');
    products.forEach(p => {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      console.log(`/product/${slug}-${p.id}`);
    });

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  }
}

generateSitemap();