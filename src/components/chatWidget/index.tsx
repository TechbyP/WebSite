import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/pictures/Logo-Symbol.png';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Props, ChatMessage } from './types';
import { introMessages, getSystemMessage } from './utils';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../data/context/ProductsContext';

type ProviderConfig = {
  name: string;
  key: string;
  model: string;
  endpoint: string;
};

const API_CONFIGS: ProviderConfig[] = [
  {
    name: 'Groq Llama On Demand',
    key: import.meta.env.VITE_GROQ_API_KEY_1 ?? '',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    name: 'Groq Llama On Demand 2',
    key: import.meta.env.VITE_GROQ_API_KEY_2 ?? '',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    name: 'Together AI',
    key: import.meta.env.VITE_TOGETHER_API_KEY_3 ?? '',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
  },
].filter((config) => config.key);

export const ChatWidget = React.memo(({ open, setOpen }: Props) => {
  // State management
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  // const [isHidden, setIsHidden] = useState(false);
  const [showFlap, setShowFlap] = useState(false);
const { t } = useTranslation();
  const { products } = useProducts();
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized values
  const isMobile = useMemo(() => window.innerWidth <= 768, []);
const systemMessage = useMemo(
  () => getSystemMessage(location.pathname, products, t),
  [location.pathname, products, t]
);


 // Enhanced animation variants
  const buttonVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 15, stiffness: 200 }
    },
    exit: { opacity: 0, x: 20, scale: 0.9 }
  };

  const flapVariants = {
    hidden: { opacity: 0, x: 80 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', damping: 15, stiffness: 200 }
    },
    exit: { opacity: 0, x: 80 }
  };

  const textVariants = {
    hidden: { opacity: 0, width: 0, marginLeft: 0 },
    visible: { 
      opacity: 1, 
      width: 'auto',
      marginLeft: '0.5rem',
      transition: { 
        opacity: { delay: 0.15 },
        width: { type: 'spring', stiffness: 200, damping: 15 }
      }
    },
    exit: { 
      opacity: 0, 
      width: 0,
      marginLeft: 0,
      transition: { 
        opacity: { duration: 0.1 },
        width: { type: 'spring', stiffness: 300 }
      }
    }
  };



  // Handle scroll behavior
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      setIsScrolling(true);
      setShowFlap(true);
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
      
      setLastScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isMobile]);

  // Initialize chat with random intro message
  useEffect(() => {
    if (open && chat.length === 0) {
      const randomIntro = introMessages[Math.floor(Math.random() * introMessages.length)];
      setChat([{ role: 'assistant', content: randomIntro }]);
    }
  }, [open, chat.length]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  // Handle viewport changes for mobile
  useEffect(() => {
    if (!isMobile || !isFullscreen) return;

    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport || !chatContainerRef.current) return;

      setViewportHeight(visualViewport.height);
      const newKeyboardHeight = Math.max(0, window.innerHeight - visualViewport.height);
      setKeyboardHeight(newKeyboardHeight > 50 ? newKeyboardHeight : 0);

      if (newKeyboardHeight > 50) {
        chatContainerRef.current.style.bottom = 'auto';
        chatContainerRef.current.style.top = `${visualViewport.offsetTop}px`;
        chatContainerRef.current.style.height = `${visualViewport.height}px`;
      } else {
        chatContainerRef.current.style.bottom = '0';
        chatContainerRef.current.style.top = 'auto';
        chatContainerRef.current.style.height = '100%';
      }
    };

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', handleResize);
    return () => viewport?.removeEventListener('resize', handleResize);
  }, [isMobile, isFullscreen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedChat = [...chat, userMessage];

    setChat(updatedChat);
    setInput('');

    if (API_CONFIGS.length === 0) {
      setChat(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, the chat is not configured right now. Please try again later.'
      }]);
      setLoading(false);
      inputRef.current?.focus();
      return;
    }

    let attempts = 0;
    let botMessage: ChatMessage | null = null;

    while (attempts < API_CONFIGS.length && !botMessage) {
      const currentIndex = (keyIndex + attempts) % API_CONFIGS.length;
      const { name, key, model, endpoint } = API_CONFIGS[currentIndex];

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [systemMessage, ...updatedChat],
          }),
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 403) {
            attempts += 1;
            continue;
          }

          throw new Error(`${name} responded with ${response.status}`);
        }

        const data = await response.json() as {
          choices?: Array<{ message?: ChatMessage }>;
        };

        botMessage = data.choices?.[0]?.message ?? {
          role: 'assistant',
          content: 'No response'
        };
        setKeyIndex((currentIndex + 1) % API_CONFIGS.length);
      } catch (error) {
        console.error('Chat request failed:', error);
        attempts += 1;
      }
    }

    if (botMessage) {
      setChat(prev => [...prev, botMessage as ChatMessage]);
    } else {
      setChat(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not get a response right now. Please try again later.'
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }, [input, chat, keyIndex, systemMessage]);

  const toggleChat = () => {
    setOpen(!open);
    setShowFlap(false);
    if (isMobile && !open) {
      setIsFullscreen(true);
    }
  };

  const handleCloseChat = () => {
    setOpen(false);
    if (isMobile) {
      setIsFullscreen(false);
    }
  };

  const showMainButton = !open && !showFlap;
  const showFlapButton = !open && showFlap;

  // Chat container styling
  const chatContainerClasses = useMemo(() => `
    fixed z-[60] transition-all duration-300 ease-in-out
    ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    ${isMobile
      ? isFullscreen
        ? 'inset-0 rounded-none bg-white'
        : 'bottom-4 right-4 w-[calc(100%-2rem)] h-[70vh] max-h-[500px] rounded-xl border border-gray-200'
      : 'bottom-24 right-6 w-[420px] h-[600px] rounded-xl border border-gray-200 bg-white'
    }
    ${!isMobile ? 'bg-white' : ''}
    shadow-xl flex flex-col overflow-hidden
  `, [open, isMobile, isFullscreen]);

  return (
    <>
   {/* Floating chat button and flap */}
      <AnimatePresence mode="wait">
        {/* Main Button */}
        {showMainButton && (
          <motion.div
            className={`fixed z-[60] ${isMobile ? 'bottom-16 right-4' : 'bottom-10 right-6'}`}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="main-button"
          >
            <motion.button
              onClick={toggleChat}
              className="flex items-center justify-center rounded-full shadow-lg bg-white p-3 border border-gray-200 focus:outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <motion.img
                sizes="(max-width: 768px) 50vw, 25vw"
srcSet={logo}
                alt="Chat"
                className="w-8 h-8"
                animate={{
                  rotate: isMobile && isScrolling ? 0 : 360,
                }}
                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              />
              {isMobile && (
                <motion.span 
                  className="text-sm font-black text-gray-700 whitespace-nowrap uppercase overflow-hidden"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  TechbyP Assistant
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Flap (small side tab) */}
        {showFlapButton && (
          <motion.div
            className="fixed bottom-16 right-0 z-[60] flex items-center bg-white/60 text-white rounded-l-full px-3 py-2 cursor-pointer shadow-lg"
            variants={flapVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="flap"
            onClick={() => setShowFlap(false)}
            layout
          >
            <motion.span 
              className="select-none font-medium text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img sizes="(max-width: 768px) 50vw, 25vw"
srcSet={logo} alt="Chat" className="w-6 h-6" />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Chat container */}
      <motion.div
        ref={chatContainerRef}
        className={chatContainerClasses}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.95 }}
        transition={{ duration: 0.3, type: 'spring' }}
      >
        <ChatHeader
          isMobile={isMobile}
          isFullscreen={isFullscreen}
          onClose={handleCloseChat}
        />

        <ChatMessages
          messages={chat}
          loading={loading}
          isMobile={isMobile}
          isFullscreen={isFullscreen}
          keyboardHeight={keyboardHeight}
          viewportHeight={viewportHeight}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          input={input}
          loading={loading}
          isMobile={isMobile}
          inputRef={inputRef}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      </motion.div>
    </>
  );
});