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

function extractProducts() {
  const content = fs.readFileSync(productsPath, 'utf-8');
  const match = content.match(/return\s*\[([\s\S]*?)\]\s*;/);
  if (!match) throw new Error('Could not extract products data');

  const products = [];
  const productBlocks = match[1].split(/(?=\s*{\s*id:)/g).filter(Boolean);
  
  productBlocks.forEach(block => {
    const idMatch = block.match(/id:\s*(\d+)/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    const imageMatch = block.match(/image:\s*([^,}\n]+)/);
    const videoMatch = block.match(/heroVideo:\s*['"]([^'"]*)['"]/);
    const dateMatch = block.match(/date:\s*(\d+)/);
    const bestsellerMatch = block.match(/bestseller:\s*(true|false)/);
    
    if (idMatch && nameMatch) {
      const isBestseller = bestsellerMatch && bestsellerMatch[1] === 'true';
      const productDate = dateMatch ? new Date(parseInt(dateMatch[1])) : new Date();
      
      const product = {
        id: idMatch[1],
        name: nameMatch[1],
        imagePath: imageMatch ? imageMatch[1].trim().replace(/"/g, '') : null,
        videoId: videoMatch && videoMatch[1] ? videoMatch[1] : null,
        lastmod: productDate.toISOString(),
        priority: isBestseller ? 0.9 : 0.7, // Differentiate priority
        changefreq: isBestseller ? 'weekly' : 'monthly' // Differentiate frequency
      };
      
      // Process image path with proper extension
      if (product.imagePath && !product.imagePath.includes('undefined')) {
        const imageName = path.basename(product.imagePath);
        product.imageUrl = `${DOMAIN}/assets/${imageName.includes('.') 
          ? product.imagePath.replace(/^\.\.\/assets\//, '')
          : `${product.imagePath.replace(/^\.\.\/assets\//, '')}.jpg`}`;
      } else {
        product.imageUrl = null;
      }
      
      products.push(product);
    }
  });

  return products;
}

async function generateSitemap() {
  try {
    const products = extractProducts();
    const stream = new SitemapStream({ 
      hostname: DOMAIN,
      xmlns: {
        image: true,
        video: true
      }
    });

    // Static routes with appropriate settings
    const staticRoutes = [
      { 
        url: '/', 
        changefreq: 'daily', 
        priority: 1.0, 
        lastmod: BUILD_DATE 
      },
      { 
        url: '/contact', 
        changefreq: 'monthly', 
        priority: 0.5, 
        lastmod: BUILD_DATE 
      },
      { 
        url: '/configurator', 
        changefreq: 'weekly', 
        priority: 0.8, 
        lastmod: BUILD_DATE 
      },
      // Other static routes...
    ];

    // Add static routes
    staticRoutes.forEach(route => {
      stream.write(route);
    });

    // Add product routes with proper media handling
    products.forEach(product => {
      const slug = product.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      
      const entry = {
        url: `/product/${slug}-${product.id}`,
        changefreq: product.changefreq,
        priority: product.priority,
        lastmod: product.lastmod
      };

      // Add images with proper extensions
      if (product.imageUrl) {
        entry.img = [{
          url: product.imageUrl,
          caption: product.name,
          title: product.name
        }];
      }

      // Add video with proper handling
      if (product.videoId) {
        entry.video = [{
          thumbnail_loc: product.imageUrl || `${DOMAIN}/assets/default-thumbnail.jpg`,
          title: product.name,
          description: `Video demonstration of ${product.name}`,
          content_loc: product.videoId.includes('youtube') 
            ? `https://www.youtube.com/watch?v=${product.videoId}`
            : `${DOMAIN}/videos/${product.videoId}`,
          family_friendly: 'yes',
          duration: product.name.includes('MP-') ? 180 : 120, // Longer for main products
          live: 'no',
          requires_subscription: 'no',
          upload_date: product.lastmod.split('T')[0] // YYYY-MM-DD format
        }];
      }

      stream.write(entry);
    });

    stream.end();

    // Generate clean XML
    const sitemap = (await streamToPromise(Readable.from(stream)))
      .toString()
      .replace(/<\/url>\s*<\/url>/g, '</url>'); // Fix duplicate closing tags

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    
    console.log(`✅ Sitemap generated with:
- ${products.length} product URLs
- ${products.filter(p => p.imageUrl).length} images
- ${products.filter(p => p.videoId).length} videos
- Last modified dates based on product dates`);
    
    // Generate a report of potential issues
    const report = {
      missingImages: products.filter(p => !p.imageUrl).map(p => p.name),
      missingVideos: products.filter(p => p.videoId && !p.imageUrl).map(p => p.name),
      possibleIssues: products.filter(p => 
        p.imageUrl && !p.imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)
      ).map(p => ({ name: p.name, imageUrl: p.imageUrl }))
    };

    if (report.missingImages.length > 0) {
      console.warn('\n⚠️ Products missing images:');
      console.warn(report.missingImages.join(', '));
    }

    if (report.possibleIssues.length > 0) {
      console.warn('\n⚠️ Images with possible extension issues:');
      report.possibleIssues.forEach(issue => {
        console.warn(`- ${issue.name}: ${issue.imageUrl}`);
      });
    }
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  }
}

generateSitemap();