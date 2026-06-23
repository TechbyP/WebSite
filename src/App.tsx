import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { HeaderProvider } from './pages/Header';
import CookieBanner from './components/CookieBanner';
import Footer from './pages/Footer.js';
import ScrollToTop from './utils/ScrollToTop';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../src/utils/context/theme-context';
import {
  ANALYTICS_CONSENT_EVENT,
  disableAnalytics,
  enableAnalytics,
  hasAnalyticsConsent,
  trackPageView,
} from './utils/analytics';
import { trackAiReferralIfPresent } from './utils/publicApi';
import LocaleAlternates from './components/seo/LocaleAlternates';

const HomePageRoute = lazy(() => import('./pages/HomePageRoute'));
const ProductDetailRoute = lazy(() => import('./pages/ProductDetailRoute'));
const OrderNowPage = lazy(() => import('./pages/OrderNowPage'));
const ContactPage = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Imprint = lazy(() => import('./pages/Imprint'));
const FileDownloadPage = lazy(() => import('./pages/Downloads'));
const BlogList = lazy(() => import('./pages/BlogList'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const ConfiguratorPage = lazy(() => import('./pages/ConfiguratorPage'));
const AdminLoginRoute = lazy(() => import('./admin/AdminLoginRoute'));
const AdminShell = lazy(() => import('./admin/AdminShell'));
const AdminDashboard = lazy(() => import('./admin/dashboard/AdminDashboard'));
const BlogPostEditor = lazy(() => import('./admin/blog/BlogPostEditor'));
const HeroPageEditor = lazy(() => import('./admin/hero/HeroPageEditor'));
const AnnouncementEditor = lazy(() => import('./admin/announcement/AnnouncementEditor'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ChatWidgetLoader = lazy(() => import('./components/chatWidget/ChatWidgetLoader'));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-gray-500 dark:text-gray-400">
    Loading...
  </div>
);

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [shouldLoadChatWidget, setShouldLoadChatWidget] = useState(false);
  const location = useLocation();

  // Load GA if consent already given
  useEffect(() => {
    const syncAnalyticsConsent = () => {
      if (hasAnalyticsConsent()) {
        void enableAnalytics();
        return;
      }

      disableAnalytics();
    };

    syncAnalyticsConsent();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncAnalyticsConsent);

    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncAnalyticsConsent);
    };
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`, document.title);
  }, [location.pathname, location.search]);

  useEffect(() => {
    trackAiReferralIfPresent();
  }, []);

  useEffect(() => {
    if (shouldLoadChatWidget) {
      return;
    }

    const loadChatWidget = () => setShouldLoadChatWidget(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleHandle = idleWindow.requestIdleCallback(loadChatWidget, { timeout: 2500 });

      return () => {
        idleWindow.cancelIdleCallback?.(idleHandle);
      };
    }

    const timerHandle = window.setTimeout(loadChatWidget, 1500);

    return () => {
      window.clearTimeout(timerHandle);
    };
  }, [shouldLoadChatWidget]);


  // Scroll behavior for homepage
  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const scrollToId = location.state?.scrollToId || new URLSearchParams(location.search).get('id');

    if (!scrollToId) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let rafId: number | undefined;
    let correctionTimer: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let firstScrollAt: number | null = null;
    const searchDeadline = performance.now() + 5000;
    const correctionDuration = 2000;
    const alignmentTolerance = 6;

    const getTargetState = () => {
      const section = document.getElementById(scrollToId);

      if (!section) {
        return null;
      }

      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
      const targetOffset = headerHeight + 20;
      const targetTop = Math.max(
        section.getBoundingClientRect().top + window.pageYOffset - targetOffset,
        0
      );
      const currentTop = section.getBoundingClientRect().top - targetOffset;

      return { section, targetTop, currentTop };
    };

    const alignSection = (behavior: ScrollBehavior) => {
      const targetState = getTargetState();

      if (!targetState) {
        return false;
      }

      if (Math.abs(targetState.currentTop) <= alignmentTolerance) {
        return true;
      }

      window.scrollTo({ top: targetState.targetTop, behavior });
      return false;
    };

    const scheduleCorrection = () => {
      if (cancelled || firstScrollAt === null) {
        return;
      }

      if (correctionTimer !== undefined) {
        window.clearTimeout(correctionTimer);
      }

      correctionTimer = window.setTimeout(() => {
        if (cancelled || firstScrollAt === null) {
          return;
        }

        alignSection('auto');

        if (performance.now() - firstScrollAt < correctionDuration) {
          scheduleCorrection();
        }
      }, 150);
    };

    const startLayoutMonitor = () => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const targetState = getTargetState();

      if (!targetState) {
        return;
      }

      resizeObserver = new ResizeObserver(() => {
        if (
          cancelled
          || firstScrollAt === null
          || performance.now() - firstScrollAt >= correctionDuration
        ) {
          return;
        }

        alignSection('auto');
        scheduleCorrection();
      });

      resizeObserver.observe(document.body);
      resizeObserver.observe(targetState.section);
    };

    const attemptScroll = () => {
      if (cancelled) {
        return;
      }

      const targetState = getTargetState();

      if (!targetState) {
        if (performance.now() < searchDeadline) {
          rafId = window.requestAnimationFrame(attemptScroll);
        }
        return;
      }

      const isInitialScroll = firstScrollAt === null;

      if (isInitialScroll) {
        firstScrollAt = performance.now();
        startLayoutMonitor();
      }

      alignSection(isInitialScroll ? 'smooth' : 'auto');
      scheduleCorrection();

      if (performance.now() < searchDeadline && performance.now() - firstScrollAt < correctionDuration) {
        rafId = window.requestAnimationFrame(attemptScroll);
      }
    };

    rafId = window.requestAnimationFrame(attemptScroll);

    return () => {
      cancelled = true;

      if (rafId !== undefined) {
        window.cancelAnimationFrame(rafId);
      }

      if (correctionTimer !== undefined) {
        window.clearTimeout(correctionTimer);
      }

      resizeObserver?.disconnect();
    };
  }, [location.pathname, location.search, location.state]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={
            <ThemeProvider>
              <HeaderProvider>
                <div className="min-h-screen bg-white dark:bg-gray-900 flex transition-colors duration-500">
                  <LocaleAlternates />
                  <main className="flex-grow transition-all duration-500 ease-in-out no-horizontal-overflow w-full max-w-[100vw]">
                    <Outlet />
                    <Footer />
                  </main>
                  <CookieBanner />
                  {shouldLoadChatWidget ? (
                    <Suspense fallback={null}>
                      <ChatWidgetLoader open={chatOpen} setOpen={setChatOpen} />
                    </Suspense>
                  ) : null}
                </div>
              </HeaderProvider>
            </ThemeProvider>
          }
        >
          <Route path="/" element={<Suspense fallback={<RouteFallback />}><HomePageRoute /></Suspense>} />
          <Route path="/products" element={<Navigate to="/?id=products" replace />} />
          <Route path="/product/:id" element={<Suspense fallback={<RouteFallback />}><ProductDetailRoute /></Suspense>} />
          <Route path="/order/:id" element={<Suspense fallback={<RouteFallback />}><OrderNowPage /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<RouteFallback />}><ContactPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<RouteFallback />}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<RouteFallback />}><TermsOfService /></Suspense>} />
          <Route path="/imprint" element={<Suspense fallback={<RouteFallback />}><Imprint /></Suspense>} />
          <Route path="/downloads" element={<Suspense fallback={<RouteFallback />}><FileDownloadPage /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={<RouteFallback />}><BlogList /></Suspense>} />
          <Route path="/blog/:id" element={<Suspense fallback={<RouteFallback />}><ArticleDetail /></Suspense>} />
          <Route path="/configurator" element={<Suspense fallback={<RouteFallback />}><ConfiguratorPage /></Suspense>} />
          <Route path="/login" element={<Suspense fallback={<RouteFallback />}><AdminLoginRoute /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
        </Route>

        <Route element={<Suspense fallback={<RouteFallback />}><AdminShell /></Suspense>}>
          <Route path="/admin" element={<Suspense fallback={<RouteFallback />}><AdminDashboard /></Suspense>} />
          <Route path="/blogedit" element={<Suspense fallback={<RouteFallback />}><BlogPostEditor /></Suspense>} />
          <Route path="/heroedit" element={<Suspense fallback={<RouteFallback />}><HeroPageEditor /></Suspense>} />
          <Route path="/announcementedit" element={<Suspense fallback={<RouteFallback />}><AnnouncementEditor /></Suspense>} />
        </Route>
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
