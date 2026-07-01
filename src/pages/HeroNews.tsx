import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react';
import Hero from '../assets/pictures/hero2.jpg?w=960;1280;1600;1920&format=webp;jpg&as=srcset';
import HeroFallback from '../assets/pictures/hero2.jpg?w=1600&format=webp';
import { useTranslation } from 'react-i18next';
import { fetchHeroItems, type PublicHeroItem } from '../utils/publicApi';

type NewsItem = PublicHeroItem;
type LocalizedContentField = 'title' | 'excerpt' | 'link' | 'cta';
type HeroActionItem = NewsItem & {
    link?: string;
    cta?: string;
};

const TRANSITION_DURATION = 300;

const CombinedHero = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);

    const getLocalizedContent = (item: NewsItem, field: LocalizedContentField): string => {
        const isGerman = currentLanguage.toLowerCase().startsWith('de');

        if (field === 'title') {
            return (isGerman ? item.title_de : item.title_en) || item.title_en || item.title_de || '';
        }

        if (field === 'excerpt') {
            return (isGerman ? item.excerpt_de : item.excerpt_en) || item.excerpt_en || item.excerpt_de || '';
        }

        if (field === 'link') {
            return (isGerman ? item.link_de : item.link_en) || item.link_en || item.link_de || '';
        }

        return (isGerman ? item.cta_de : item.cta_en) || item.cta_en || item.cta_de || '';
    };
    const formatTitle = (title: string) => {
        if (!title) return '';

        const words = title.split(' ');
        if (words.length <= 2) return title;

        const lastTwoWords = words.splice(-2).join(' ');
        const remainingWords = words.join(' ');

        return (
            <>
                {remainingWords} <br />
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl uppercase text-brandgreen leading-tight">
                    {lastTwoWords}
                </span>
            </>
        );
    };

    useEffect(() => {
        const loadHeroItems = async () => {
            try {
                const items = await fetchHeroItems();

                // Add hardcoded home screen item
                const homeItem: NewsItem = {
                    id: 'home-screen',
                    type: 'announcement',
                    title_en: '',
                    title_de: '',
                    excerpt_en: '',
                    excerpt_de: '',
                    image: HeroFallback,
                    date: '',
                    link_en: '',
                    link_de: '',
                    cta_en: '',
                    cta_de: '',
                    order: 0,
                    isHomeScreen: true
                };

                items.sort((a, b) => (a.order || 0) - (b.order || 0));
                setNewsItems([homeItem, ...items]);
            } catch (error) {
                console.error("Error fetching hero items:", error);
                setNewsItems([
                    {
                        id: 'home-screen',
                        type: 'announcement',
                        title_en: '',
                        title_de: '',
                        excerpt_en: '',
                        excerpt_de: '',
                        image: HeroFallback,
                        date: '',
                        link_en: '',
                        link_de: '',
                        cta_en: '',
                        cta_de: '',
                        order: 0,
                        isHomeScreen: true
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadHeroItems();
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (newsItems.length <= 1 || !touchStart || !touchEnd || isTransitioning) return;
        const threshold = 50;
        const difference = touchStart - touchEnd;
        if (difference > threshold) {
            handleNavigation(1);
        } else if (difference < -threshold) {
            handleNavigation(-1);
        }
        setTouchStart(0);
        setTouchEnd(0);
    };

    useEffect(() => {
        if (currentIndex >= newsItems.length) {
            setCurrentIndex(0);
        }

        if (newsItems.length <= 1 && isTransitioning) {
            setIsTransitioning(false);
        }
    }, [currentIndex, isTransitioning, newsItems.length]);

    useEffect(() => {
        setIsMounted(true);
        controls.start({
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        });

        return () => {
            setIsMounted(false);
        };
    }, [controls]);

    const isHomeScreen = newsItems[currentIndex]?.isHomeScreen;
    const canNavigate = newsItems.length > 1;
    const currentHeroSrc = isHomeScreen ? HeroFallback : newsItems[currentIndex]?.image || '';
    const currentHeroSrcSet = isHomeScreen ? Hero : undefined;

    const handleNavigation = useCallback((newDirection: number) => {
        if (!canNavigate || isTransitioning || !isMounted) {
            if (!canNavigate && isTransitioning) {
                setIsTransitioning(false);
            }
            return;
        }

        setIsTransitioning(true);
        setCurrentIndex((prev) => {
            return newDirection > 0
                ? (prev === newsItems.length - 1 ? 0 : prev + 1)
                : (prev === 0 ? newsItems.length - 1 : prev - 1);
        });
    }, [canNavigate, isTransitioning, newsItems.length, isMounted]);

    useEffect(() => {
        if (!canNavigate || isHovered || isTransitioning) return;
        const delay = isHomeScreen ? 15000 : 12000;
        const timer = setInterval(() => {
            handleNavigation(1);
        }, delay);
        return () => clearInterval(timer);
    }, [canNavigate, isHovered, isTransitioning, handleNavigation, isHomeScreen]);

    const handleAnimationComplete = useCallback(() => {
        setIsTransitioning(false);
        if (!isHovered) {
            controls.start({
                opacity: 1,
                scale: 1,
                transition: { type: 'spring', stiffness: 300, damping: 30 }
            });
        }
    }, [controls, isHovered]);

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - (window.innerWidth < 768 ? 64 : 96),
                behavior: 'smooth'
            });
        }
    };

    const newsTypeLabels: Record<NewsItem['type'], string> = {
        product: t('hero.newsTypes.product'),
        event: t('hero.newsTypes.event'),
        announcement: t('hero.newsTypes.announcement'),
        blog: t('hero.newsTypes.blog')
    };

    const SafeButton = ({ item }: { item: HeroActionItem }) => {
        const [isClicked, setIsClicked] = useState(false);
        const buttonRef = useRef<HTMLAnchorElement>(null);

        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isTransitioning && !isClicked && item.link && isMounted) {
                const targetLink = item.link;
                setIsClicked(true);
                if (buttonRef.current) {
                    buttonRef.current.getBoundingClientRect();
                }
                setTimeout(() => {
                    if (!isMounted) return;
                    if (targetLink.startsWith('http')) {
                        window.open(targetLink, '_blank');
                    } else {
                        window.location.href = targetLink;
                    }
                    setIsClicked(false);
                }, TRANSITION_DURATION + 100);
            }
        };

        if (!item.cta) return null;

        return (
            <motion.a
                ref={buttonRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: isMounted ? 1 : 0 }}
                transition={{ delay: 1.1 }}
                href={item.link}
                onClick={handleClick}
                className={`inline-flex items-center bg-brandgreen/50 border-2 border-white/50 hover:border-white/80 hover:bg-brandgreen text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all group backdrop-blur-sm ${isTransitioning || isClicked || !isMounted ? 'pointer-events-none opacity-70' : ''}`}
                aria-label={item.cta}
            >
                {item.cta}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
        );
    };

    const HomeScreenButton = ({
        onClick,
        children,
        withIcon = true,
        ariaLabel,
    }: {
        onClick: (e: React.MouseEvent) => void;
        children: React.ReactNode;
        withIcon?: boolean;
        ariaLabel: string;
    }) => {
        const [isClicked, setIsClicked] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);

        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isTransitioning && !isClicked && isMounted) {
                setIsClicked(true);
                if (buttonRef.current) {
                    buttonRef.current.getBoundingClientRect();
                }
                setTimeout(() => {
                    if (!isMounted) return;
                    onClick(e);
                    setIsClicked(false);
                }, TRANSITION_DURATION + 100);
            }
        };

        return (
            <button
                ref={buttonRef}
                onClick={handleClick}
                className={`${isClicked || isTransitioning || !isMounted ? 'pointer-events-none opacity-70' : ''
                    } ${withIcon
                        ? 'bg-brandgreen/50 border-2 border-white/50 hover:border-white/80 hover:bg-brandgreen px-6 py-3 sm:px-8 sm:py-4'
                        : 'border-2 border-white/30 hover:border-white/50 px-6 py-3 sm:px-8 sm:py-4'
                    } text-white rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center backdrop-blur-sm`}
                disabled={!isMounted || isTransitioning}
                aria-label={ariaLabel}
            >
                {children}
                {withIcon && <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
        );
    };

    if (isLoading || newsItems.length === 0) {
        return (
            <section className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-96px)] overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">{t('hero.loading')}</div>
            </section>
        );
    }

    const currentItem = newsItems[currentIndex];

    return (
        <section
            className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-96px)] overflow-hidden"
            ref={containerRef}
            aria-live="polite"
            aria-atomic="true"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Navigation Arrows */}
            {canNavigate && (
                <div className="absolute inset-0 z-30 pointer-events-none flex justify-between">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(-1);
                        }}
                        className="w-16 h-full flex items-start md:items-center justify-start px-2
                    md:opacity-0 md:hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r from-black/10 to-transparent
                    group pointer-events-auto"
                        aria-label="Previous slide"
                        disabled={isTransitioning || !isMounted}
                    >
                        <div className="mt-4 md:mt-0 p-2 rounded-full bg-black/30 group-hover:bg-black/50 backdrop-blur-sm">
                            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white/80 group-hover:text-white" />
                        </div>
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(1);
                        }}
                        className="w-16 h-full flex items-start md:items-center justify-end px-2
                    md:opacity-0 md:hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-l from-black/10 to-transparent
                    group pointer-events-auto"
                        aria-label="Next slide"
                        disabled={isTransitioning || !isMounted}
                    >
                        <div className="mt-4 md:mt-0 p-2 rounded-full bg-black/30 group-hover:bg-black/50 backdrop-blur-sm">
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white/80 group-hover:text-white" />
                        </div>
                    </button>
                </div>
            )}

            {/* Carousel Items */}
            <AnimatePresence initial={false}>
                {isMounted && (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
                        onAnimationComplete={handleAnimationComplete}
                        className="absolute inset-0"
                    >
                        {/* Background */}
                        <div id="Hero" className="absolute inset-0 bg-black/40 overflow-hidden">
                            <img
                                src={currentHeroSrc}
                                srcSet={currentHeroSrcSet}
                                sizes="100vw"
                                alt=""
                                aria-hidden="true"
                                width={1920}
                                height={1080}
                                className="w-full h-full object-cover select-none"
                                style={{ objectPosition: 'center center' }}
                                draggable={false}
                                fetchPriority={currentItem?.isHomeScreen ? 'high' : 'auto'}
                                loading={currentItem?.isHomeScreen ? 'eager' : 'lazy'}
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24">
                            <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
                                {isHomeScreen ? (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: {},
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.3, // text elements stagger
                                                },
                                            },
                                        }}
                                        className="flex flex-col w-full gap-6 md:gap-8"
                                    >
                                        {/* Tagline */}
                                        <motion.span
                                            variants={{
                                                hidden: { opacity: 0, y: -10 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                            className="inline-block w-max px-3 py-1 text-sm font-medium text-brandgreen bg-blue-400/10 rounded-full backdrop-blur-sm"
                                        >
                                            {t('hero.home.tagline')}
                                        </motion.span>

                                        {/* Title */}
                                        <motion.h1
                                            variants={{
                                                hidden: { opacity: 0, y: -10 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                            className="text-left leading-tight text-white font-black"
                                        >
                                            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl block uppercase">
                                                {t('hero.home.titleLine1')}
                                            </span>
                                            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl block text-brandgreen uppercase">
                                                {t('hero.home.titleLine2')}
                                            </span>
                                        </motion.h1>

                                        {/* Description */}
                                        <motion.p
                                            variants={{
                                                hidden: { opacity: 0, y: -10 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                            className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed"
                                        >
                                            {t('hero.home.description')}
                                        </motion.p>

                                        {/* Buttons */}
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, y: 20 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                            transition={{ delay: 0.6 }} // buttons animate after text
                                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                                        >
                                            <HomeScreenButton
                                                onClick={() => scrollToSection('products')}
                                                withIcon
                                                ariaLabel={t('hero.home.ctaProducts')}
                                            >
                                                {t('hero.home.ctaProducts')}
                                            </HomeScreenButton>

                                            <HomeScreenButton
                                                onClick={() => scrollToSection('demo')}
                                                withIcon={false}
                                                ariaLabel={t('hero.home.ctaDemo')}
                                            >
                                                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                {t('hero.home.ctaDemo')}
                                            </HomeScreenButton>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Other slides */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="mb-4 md:mb-6"
                                        >
                                            <span className="inline-block px-3 py-1 text-sm font-medium text-brandgreen bg-blue-400/10 rounded-full backdrop-blur-sm">
                                                {newsTypeLabels[currentItem.type]}
                                            </span>
                                        </motion.div>

                                        <motion.h2
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-left leading-tight text-white font-black mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase"
                                        >
                                            {formatTitle(getLocalizedContent(currentItem, 'title'))}
                                        </motion.h2>

                                        <motion.p
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 md:mb-8 w-full md:w-4/5 lg:w-3/4 leading-relaxed"
                                        >
                                            {getLocalizedContent(currentItem, 'excerpt')}
                                        </motion.p>

                                        {currentItem.date && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.9 }}
                                                className="text-sm font-medium mb-6 md:mb-8 text-gray-300"
                                            >
                                                {currentItem.date}
                                            </motion.div>
                                        )}

                                        {(currentItem.cta_en || currentItem.cta_de) && (
                                            <SafeButton
                                                item={{
                                                    ...currentItem,
                                                    cta: getLocalizedContent(currentItem, 'cta'),
                                                    link: getLocalizedContent(currentItem, 'link'),
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>


    );
};

export default CombinedHero;