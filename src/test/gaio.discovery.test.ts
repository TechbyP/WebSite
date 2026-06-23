import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const readPublicFile = (relativePath: string) => {
  return fs.readFileSync(path.join(ROOT_DIR, 'public', relativePath), 'utf-8');
};

describe('GAIO discovery files', () => {
  it('publishes ai-manifest feed map and telemetry metadata', () => {
    const manifest = JSON.parse(readPublicFile(path.join('content', 'ai-manifest.json')));

    expect(manifest.site).toBe('https://www.techbyp.com');
    expect(manifest.telemetry).toBe('firestore:ai_signals');
    expect(manifest.feeds).toMatchObject({
      products: '/content/products.json',
      blogIndex: '/content/blog-index.json',
      faq: '/content/faq.json',
      announcements: '/content/announcements.json',
      heroItems: '/content/hero-items.json',
    });
  });

  it('keeps llms and ai policy files aligned with feeds', () => {
    const llms = readPublicFile('llms.txt');
    const aiPolicy = readPublicFile('ai.txt');

    expect(llms).toContain('https://www.techbyp.com/content/ai-manifest.json');
    expect(llms).toContain('telemetry: firestore:ai_signals');
    expect(llms).not.toContain('/api/');

    expect(aiPolicy).toContain('preferred-feed: /content/ai-manifest.json');
    expect(aiPolicy).toContain('telemetry: firestore:ai_signals');
    expect(aiPolicy).not.toContain('/api/');
  });

  it('publishes hreflang alternate links in sitemap output', () => {
    const sitemap = readPublicFile('sitemap.xml');

    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(sitemap).toContain('hreflang="de"');
    expect(sitemap).toContain('hreflang="x-default"');
  });
});
