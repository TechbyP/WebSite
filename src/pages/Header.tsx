import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import techbypLogo from '../assets/pictures/techbyp.png';
import { Menu, X, ChevronDown, Download, Globe, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation, i18n } from 'react-i18next';
import { useTheme } from '../utils/context/theme-context';
import techbypLogoDark from '../assets/pictures/techbypLogoDark.png'






interface HeaderContextProps {
  isVisible: boolean;
  height: number;
}

const HeaderContext = createContext<HeaderContextProps>({ isVisible: true, height: 0 });
export const useHeader = () => useContext(HeaderContext);

interface Category {
  value: string;
  label: string;
}

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [isVisible, setIsVisible] = useState(true);
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const lastScroll = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [viewportSize, setViewportSize] = useState<'sm' | 'md' | 'lg'>('lg');

  // Apply theme class to body element
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguageDropdownOpen(false);
  };

  const currentLanguage = i18n.language;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setViewportSize('sm');
      else if (width < 1024) setViewportSize('md');
      else setViewportSize('lg');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categoryLabels: Record<string, string> = {
    all: t('header.categories.all'),
    smartsystems: t('header.categories.smartsystems'),
    accessory: t('header.categories.accessory'),
    manual: t('header.categories.manual'),
  };

  const categories: Category[] = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));

  // Measure header height dynamically with resize observer
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Adaptive scroll behavior based on viewport size
  useEffect(() => {
    const onScroll = () => {
      if (menuOpen || languageDropdownOpen) return;

      const y = window.scrollY;
      if (y < 0) return;

      // More sensitive hiding on mobile, less on desktop
      const threshold = viewportSize === 'sm' ? 100 : viewportSize === 'md' ? 200 : 1200;
      setIsVisible(y < lastScroll.current || y < threshold);
      lastScroll.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen, viewportSize, languageDropdownOpen]);

  // Improved mobile menu handling with focus trap
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    // Focus trap for accessibility
    const focusableElements = ref.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      firstElement.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        } else if (e.key === 'Escape') {
          setMenuOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [menuOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToId = (id: string) => {
    setProductsOpen(false);
    setMenuOpen(false);
    if (pathname === '/') scrollTo(id);
    else navigate(`/?id=${id}`, { state: { scrollToId: id } });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerHeight = ref.current?.offsetHeight || 0;
      window.scrollTo({
        top: el.offsetTop - headerHeight - 20,
        behavior: 'smooth'
      });
    }
  };

  // Language options configuration
const languageOptions = [
  {
    code: 'en',
    name: t('header.languageSwitcher.en'),
    flag: '🇬🇧',
    ariaLabel: t('header.languageSwitcher.switchToEnglish')
  },
  {
    code: 'de',
    name: t('header.languageSwitcher.de'),
    flag: '🇩🇪',
    ariaLabel: t('header.languageSwitcher.switchToGerman')
  },
  {
    code: 'es',
    name: t('header.languageSwitcher.es'),
    flag: '🇪🇸',
    ariaLabel: t('header.languageSwitcher.switchToSpanish')
  },
  {
    code: 'fr',
    name: t('header.languageSwitcher.fr'),
    flag: '🇫🇷',
    ariaLabel: t('header.languageSwitcher.switchToFrench')
  },
  {
    code: 'ro',
    name: t('header.languageSwitcher.ro'),
    flag: '🇷🇴',
    ariaLabel: t('header.languageSwitcher.switchToRomanian')
  }
];


  return (

    <HeaderContext.Provider value={{ isVisible, height }}>
      <header
        ref={ref}
        className={`sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-md
            ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        role="banner"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`mx-auto w-full flex flex-col ${viewportSize === 'lg' ? 'max-w-7xl' : 'max-w-full'}`}>
            <div className="flex justify-between items-center h-14 md:h-20 py-2 md:py-0">
              <div
                role="link"
                tabIndex={0}
                aria-label={t('header.logoLabel')}
                onClick={() => goToId('Hero')}
                onKeyDown={(e) => e.key === 'Enter' && goToId('Hero')}
                className="cursor-pointer flex-shrink-0 min-w-[120px] md:min-w-[160px]"
              >
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
                  src={theme === 'light' ? techbypLogo : techbypLogoDark}
                  alt={t('header.logoAlt')}
                  className="h-8 md:h-14 object-contain transition duration-300 ease-in-out hover:scale-105"
                  draggable={false}
                  loading="eager"
                />

              </div>

              <nav
                aria-label="Primary navigation"
                className={`hidden ${viewportSize === 'lg' ? 'md:flex' : 'lg:flex'} space-x-4 lg:space-x-6 items-center`}
              >
                {['products', 'applications', 'about'].map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToId(id);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen px-2 py-2 text-sm md:text-base font-black focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 rounded transition-colors duration-200"
                  >
                    {t(`header.navigation.${id}`)}
                  </a>
                ))}

                <button
                  onClick={() => navigate('/blog')}
                  className="text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen px-2 py-2 text-sm md:text-base font-black focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 rounded transition-colors duration-200"
                >
                  {t('header.navigation.insights')}
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  className="text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen px-2 py-2 text-sm md:text-base font-black focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 rounded transition-colors duration-200"
                >
                  {t('header.navigation.contact')}
                </button>
              </nav>

              <div className={`hidden ${viewportSize === 'lg' ? 'md:flex' : 'lg:flex'} items-center ml-4 space-x-2`}>
                <button
                  onClick={() => navigate('/downloads')}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen px-2 py-2 text-sm md:text-base font-medium focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 rounded transition-colors duration-200"
                // aria-label={t('header.navigation.downloads')}
                >
                  <Download className="h-4 w-4 md:h-5 md:w-5 mr-1" aria-hidden="true" />
                  {/* <span className={`${viewportSize === 'md' ? 'hidden md:inline' : ''}`}>
                    {t('header.navigation.downloads')}
                  </span> */}
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? t('headerTheme.switchToDark') : t('headerTheme.switchToLight')}
                  className="text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen p-2 rounded focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors duration-200"
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>

                {/* Enhanced Language Switcher - Desktop */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    aria-label={t('header.languageSwitcher.ariaLabel')}
                    aria-expanded={languageDropdownOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen px-3 py-2 text-sm md:text-base font-medium focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 rounded transition-colors duration-200"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {languageOptions.find(lang => lang.code === currentLanguage)?.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${languageDropdownOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {languageDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-auto origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50 animate-fade-in"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="language-menu-button"
                    >
                      <div className="py-1" role="none">
                        {languageOptions.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            aria-label={lang.ariaLabel}
                            className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-gray-900 dark:hover:text-gray-100 ${currentLanguage === lang.code ? 'bg-gray-50 dark:bg-gray-700 font-medium' : ''
                              }`}
                            role="menuitem"
                          >
                            <span className="mr-2 text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                            {currentLanguage === lang.code && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-brandgreen" aria-hidden="true"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${viewportSize === 'lg' ? 'md:hidden' : 'lg:hidden'} flex items-center`}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen min-w-[44px] min-h-[44px] p-2 pl-48 rounded focus:outline-brandgreen focus:outline-2 focus:outline-offset-2"
                  aria-label={menuOpen ? t('header.mobileMenu.close') : t('header.mobileMenu.open')}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  aria-haspopup="true"
                >
                  {menuOpen ? (
                    <X size={24} aria-hidden="true" className="w-6 h-6" />
                  ) : (
                    <Menu size={24} aria-hidden="true" className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {menuOpen && (
              <nav
                id="mobile-menu"
                className={`${viewportSize === 'lg' ? 'md:hidden' : 'lg:hidden'} bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg`}
                aria-label="Mobile navigation"
                aria-modal="true"
              >
                <div className="px-4 pt-2 pb-6 space-y-2">
                  {['products', 'applications', 'about'].map((id) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        goToId(id);
                      }}
                      className="block px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-white rounded-lg focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors"
                    >
                      {t(`header.navigation.${id}`)}
                    </a>
                  ))}

                  <button
                    onClick={() => {
                      navigate('/blog');
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-white rounded-lg focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors"
                  >
                    {t('header.navigation.insights')}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/contact');
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-white rounded-lg focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors"
                  >
                    {t('header.navigation.contact')}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/downloads');
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-white rounded-lg focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-3" aria-hidden="true" />
                    {t('header.navigation.downloads')}
                  </button>

                  {/* Theme Toggle - Mobile */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 hover:bg-brandgreen hover:text-white rounded-lg focus:outline-brandgreen focus:outline-2 focus:outline-offset-2 transition-colors"
                  >
                    {theme === 'light' ? (
                      <Moon className="h-5 w-5 mr-3" aria-hidden="true" />
                    ) : (
                      <Sun className="h-5 w-5 mr-3" aria-hidden="true" />
                    )}
                    {theme === 'light' ? t('headerTheme.switchToDark') : t('headerTheme.switchToLight')}
                  </button>

                  {/* Enhanced Language Switcher - Mobile */}
                  <div className="w-full">
                    <select
                      id="language-select"
                      value={currentLanguage}
                      onChange={(e) => {
                        changeLanguage(e.target.value);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-lg font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandgreen transition-colors"
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="ro">🇷🇴 Română</option>
                    </select>
                  </div>

                </div>
              </nav>
            )}
          </div>
        </div>
      </header>
      {children}
    </HeaderContext.Provider>

  );
};