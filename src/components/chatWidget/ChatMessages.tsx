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
      className="flex-1 overflow-y-auto flex flex-col p-4"
      style={{
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : '1rem',
        background: 'rgba(249, 250, 251, 0.7)',
        maxHeight: isMobile && isFullscreen && keyboardHeight > 0
          ? `calc(${viewportHeight}px - ${56 + 64}px)`
          : undefined,
      }}
    >
      <div className="space-y-3">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`break-words rounded-xl px-4 py-2 max-w-[90%] ${msg.role === 'user'
              ? 'bg-brandblue/10 text-right ml-auto border border-brandblue/20 shadow-sm'
              : 'bg-white text-left mr-auto border border-gray-200 shadow'
              }`}
            style={{
              maxHeight: '70vh', // Limit message height
              overflowY: 'auto', // Enable scrolling for long messages
              wordBreak: 'break-word', // Better text wrapping
            }}
          >
            <div className="max-h-full overflow-y-auto">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            {msg.role === 'assistant' && (
              <div className="mt-2">
                <ProductButton content={msg.content} />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400 text-xs"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-brandblue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-brandblue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-brandblue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Assistant is typing...</span>
          </motion.div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
});