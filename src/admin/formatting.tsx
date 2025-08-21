import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import sanitizeHtml from 'sanitize-html';

/**
 * Formats bytes to human-readable format
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === undefined || bytes === null) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Formats milliseconds to human-readable time
 */
export const formatTime = (ms: number): string => {
  if (ms === undefined || ms === null) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Formats a number with commas
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Formats percentage
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formats relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};

/**
 * Formats content (HTML or Markdown) for display
 * Adapted for dark mode
 */
export const formatContentForDisplay = (content: string[] | string | undefined): JSX.Element[] => {
  if (!content) {
    return [<div key="0" className="mb-4"><p className="text-gray-900 dark:text-gray-100">No content available</p></div>];
  }

  const contentArray = Array.isArray(content) ? content : [content];

  return contentArray.map((text, index) => {
    if (!text || text.trim() === '' || text.trim() === '<p></p>' || text.trim() === '<p><br></p>') {
      return <div key={`spacer-${index}`} className="h-6" />;
    }

    const isHtml = /<[a-z][\s\S]*>/i.test(text);

    if (isHtml) {
      const sanitizedHtml = sanitizeHtml(text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title', 'width', 'height', 'class']
        }
      });

      return (
        <div 
          key={`html-${index}`} 
          className="mb-4 prose max-w-none text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    const markdownComponent = (
      <ReactMarkdown 
        key={`markdown-${index}`}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        className="text-gray-900 dark:text-gray-100"
      >
        {text}
      </ReactMarkdown>
    );

    if (index === 0) {
      return (
        <div key={index} className="mb-4">
          <p className="first-letter:text-5xl first-letter:float-left first-letter:pr-2 first-letter:leading-none">
            {markdownComponent}
          </p>
        </div>
      );
    }

    return <div key={index} className="mb-4">{markdownComponent}</div>;
  }).filter(Boolean) as JSX.Element[];
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const generateExcerpt = (content: string[] | undefined, maxLength = 160): string => {
  if (!content || content.length === 0) return '';

  const firstPara = content[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\n/g, ' ')
    .trim();

  if (firstPara.length <= maxLength) return firstPara;
  return firstPara.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const markdownToPlainText = (markdown: string): string => {
  return markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`(.*?)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();
};
