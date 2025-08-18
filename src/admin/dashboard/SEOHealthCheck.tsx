import { useState, useEffect } from 'react';
import { useAnalytics } from './hooks/useAnalytics';

interface SEOIssue {
  id: string;
  type: 'missing' | 'invalid' | 'duplicate';
  element: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  fix?: string;
  debugInfo?: string;
}

const getElementSelector = (el: Element | null) => {
  if (!el) return '';
  let selector = el.tagName.toLowerCase();
  if (el.id) selector += `#${el.id}`;
  if (el.className) {
    const classes = el.className.toString().split(/\s+/).filter(Boolean);
    if (classes.length) selector += '.' + classes.join('.');
  }
  return selector;
};

const getElementSnippet = (el: Element | null, maxLength = 100) => {
  if (!el) return '';
  let text = el.textContent?.trim() || '';
  if (text.length > maxLength) text = text.slice(0, maxLength) + '...';
  return text;
};

const SEOHealthCheck = () => {
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const checkSEO = async () => {
      try {
        const foundIssues: SEOIssue[] = [];
        let totalPoints = 0;
        let maxPoints = 6;

        const currentURL = window.location.href;

        // 1. Check <title>
        const titleEl = document.querySelector('title');
        const title = titleEl?.textContent?.trim() || '';
        if (!title) {
          foundIssues.push({
            id: 'missing-title',
            type: 'missing',
            element: '<title>',
            message: 'The page is missing a <title> element.',
            severity: 'high',
            fix: 'Add a descriptive <title> tag inside the <head> section.',
            debugInfo: `URL: ${currentURL}`
          });
        } else {
          totalPoints++;
        }

        // 2. Duplicate <title>
        const allTitles = document.querySelectorAll('title');
        if (allTitles.length > 1) {
          foundIssues.push({
            id: 'duplicate-title',
            type: 'duplicate',
            element: '<title>',
            message: 'Multiple <title> elements found. Only one should exist.',
            severity: 'medium',
            fix: 'Remove extra <title> tags.',
            debugInfo: `URL: ${currentURL} | Count: ${allTitles.length}`
          });
        }

        // 3. Meta description
        const metaDescEl = document.querySelector('meta[name="description"]');
        const metaDescription = metaDescEl?.getAttribute('content')?.trim() || '';
        if (!metaDescription) {
          foundIssues.push({
            id: 'missing-meta-description',
            type: 'missing',
            element: '<meta name="description">',
            message: 'Missing or empty meta description tag.',
            severity: 'high',
            fix: 'Add a relevant meta description tag.',
            debugInfo: `URL: ${currentURL}`
          });
        } else {
          totalPoints++;
        }

        // 4. <h1>
        const h1Elements = Array.from(document.querySelectorAll('h1'));
        if (h1Elements.length === 0) {
          foundIssues.push({
            id: 'missing-h1',
            type: 'missing',
            element: '<h1>',
            message: 'No <h1> heading found.',
            severity: 'high',
            fix: 'Add a single, descriptive <h1> heading.',
            debugInfo: `URL: ${currentURL}`
          });
        } else {
          totalPoints++;
        }
        if (h1Elements.length > 1) {
          const selectors = h1Elements.map((el, i) => getElementSelector(el)).join(', ');
          foundIssues.push({
            id: 'duplicate-h1',
            type: 'duplicate',
            element: '<h1>',
            message: 'Multiple <h1> headings found; recommended to have only one.',
            severity: 'medium',
            fix: 'Use only one main <h1> heading.',
            debugInfo: `URL: ${currentURL} | Selectors: ${selectors}`
          });
        }

        // 5. Images missing alt
        const images = Array.from(document.querySelectorAll('img'));
        const imgsMissingAlt = images.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt')?.trim() === '');
        if (imgsMissingAlt.length > 0) {
          const snippets = imgsMissingAlt.slice(0, 3).map(img => {
            return `Tag: <img src="${img.getAttribute('src') || 'unknown'}" class="${img.className || ''}">`;
          }).join(' | ');
          foundIssues.push({
            id: 'missing-alt',
            type: 'missing',
            element: '<img>',
            message: `${imgsMissingAlt.length} image(s) missing alt attributes.`,
            severity: 'medium',
            fix: 'Add descriptive alt attributes to images.',
            debugInfo: `URL: ${currentURL} | Examples: ${snippets}${imgsMissingAlt.length > 3 ? '...' : ''}`
          });
        } else {
          totalPoints++;
        }

        // 6. Broken internal links
        const links = Array.from(document.querySelectorAll('a[href]'));
        const brokenLinks = links.filter(link => {
          const href = link.getAttribute('href')?.trim() || '';
          return href === '' || href === '#';
        });
        if (brokenLinks.length > 0) {
          const hrefs = brokenLinks.slice(0, 3).map(link => {
            const text = getElementSnippet(link, 30);
            return `"${text}" (href="${link.getAttribute('href')}")`;
          }).join(' | ');
          foundIssues.push({
            id: 'broken-links',
            type: 'invalid',
            element: '<a href="">',
            message: `${brokenLinks.length} internal link(s) have empty or "#" href attributes.`,
            severity: 'low',
            fix: 'Replace empty or "#" hrefs with valid URLs.',
            debugInfo: `URL: ${currentURL} | Examples: ${hrefs}${brokenLinks.length > 3 ? '...' : ''}`
          });
        } else {
          totalPoints++;
        }

        const calculatedScore = Math.round((totalPoints / maxPoints) * 100);

        setIssues(foundIssues);
        setScore(calculatedScore);
        trackEvent('seo_audit', { score: calculatedScore, issues: foundIssues.length });
      } catch (error) {
        console.error('SEO check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSEO();
  }, [trackEvent]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">SEO Health Check</h3>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={score > 80 ? '#10B981' : score > 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={`${score}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-2xl font-bold ${
                      score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  >
                    {score}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold">SEO Score</h4>
              <p className="text-sm text-gray-500 mt-1">
                {score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs improvement'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-md font-semibold mb-4">Issues Found ({issues.length})</h4>
            <div className="space-y-4">
              {issues.length === 0 ? (
                <p className="text-gray-600">No SEO issues detected.</p>
              ) : (
                issues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div
                        className={`mt-1 mr-3 w-3 h-3 rounded-full ${
                          issue.severity === 'high'
                            ? 'bg-red-500'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{issue.element}</h5>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                        {issue.fix && <p className="text-sm text-green-600 mt-1">Fix: {issue.fix}</p>}
                        {issue.debugInfo && (
                          <details className="text-xs mt-2 text-gray-500">
                            <summary>Debug Info</summary>
                            <pre className="whitespace-pre-wrap">{issue.debugInfo}</pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOHealthCheck;
