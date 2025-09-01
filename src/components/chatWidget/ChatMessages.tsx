import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from './types';
import { ProductButton } from '../../utils/ProductButton';

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  isMobile: boolean;
  isFullscreen: boolean;
  keyboardHeight: number;
  viewportHeight: number;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Enhanced link processing that works with ReactMarkdown components
const CustomLink = ({ href, children }: { href?: string; children: React.ReactNode }) => {
  if (href?.startsWith('/')) {
    return (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline font-medium"
        onClick={(e) => {
          e.preventDefault();
          window.open(href, '_blank');
        }}
      >
        {children}
      </a>
    );
  }
  
  return (
    <a 
      href={href} 
      className="text-blue-600 hover:text-blue-800 underline font-medium"
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

// Pre-process content to enhance specific patterns before markdown rendering
const preProcessContent = (content: string): string => {
  // Convert MP patterns to markdown links
  let processed = content.replace(
    /(MP\d+\.\d+)/g, 
    (match) => `[${match}](/manual-page/${match.toLowerCase()})`
  );
  
  // Convert Section patterns to markdown links
  processed = processed.replace(
    /(Section\s+\d+\.\d+)/gi, 
    (match) => `[${match}](/section/${match.toLowerCase().replace(/\s+/g, '-')})`
  );
  
  return processed;
};

export const ChatMessages = React.memo(({
  messages,
  loading,
  isMobile,
  isFullscreen,
  keyboardHeight,
  viewportHeight,
  messagesEndRef
}: Props) => {
  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col p-4 bg-gray-50 dark:bg-gray-900"
      style={{
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : '1rem',
        maxHeight: isMobile && isFullscreen && keyboardHeight > 0
          ? `calc(${viewportHeight}px - ${56 + 64}px)`
          : undefined,
      }}
    >
      <div className="space-y-3">
        {messages.map((msg, idx) => {
          const processedContent = msg.role === 'assistant' ? preProcessContent(msg.content) : msg.content;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`break-words rounded-xl px-4 py-2 max-w-[90%] 
                ${msg.role === 'user'
                  ? 'bg-brandblue/10 dark:bg-brandblue/20 text-right ml-auto border border-brandblue/20 dark:border-brandblue/40 shadow-sm dark:shadow-md'
                  : 'bg-white dark:bg-gray-800 text-left mr-auto border border-gray-200 dark:border-gray-700 shadow dark:shadow-md'
                }`}
              style={{
                maxHeight: '70vh',
                overflowY: 'auto',
                wordBreak: 'break-word',
              }}
            >
              <div className="max-h-full overflow-y-auto">
                {msg.role === 'user' ? (
                  <p className="text-gray-900 dark:text-gray-100 mb-0">{msg.content}</p>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-gray-900 dark:text-gray-100" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
                      em: ({ node, ...props }) => <em className="italic text-gray-900 dark:text-gray-100" {...props} />,
                      a: ({ node, ...props }) => <CustomLink {...props} />,
                    }}
                  >
                    {processedContent}
                  </ReactMarkdown>
                )}
              </div>
              {msg.role === 'assistant' && (
                <div className="mt-2">
                  <ProductButton content={msg.content} />
                </div>
              )}
            </motion.div>
          );
        })}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-brandblue dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-brandblue dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-brandblue dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Assistant is typing...</span>
          </motion.div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
});