import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { HeaderProvider } from './pages/Header';
import CookieBanner from './components/CookieBanner';
import Footer from './pages/footer/Footer';
import ProductDetail from './pages/ProductDetail';
import OrderNow from './components/OrderNow';
import { ChatWidget } from './components/chatWidget/index';
import BlogList from './pages/BlogList';
import ArticleDetail from './pages/ArticleDetail';
import BlogPostEditor from './admin/blog/BlogPostEditor';
import ScrollToTop from './utils/ScrollToTop';
import ContactPage from './pages/Contact';
import PrivacyPolicy from './pages/footer/PrivacyPolicy';
import TermsOfService from './pages/footer/TermsOfService';
import Imprint from './pages/footer/Imprint';
import FileDownloadPage from './pages/Downloads';
import { Toaster } from 'sonner';
import { Configurator } from './components/configurator/Configurator';
import { ConfiguratorProvider } from './components/configurator/contexts/ConfiguratorContext';
import HomePage from './pages/HomePage';
import { AuthProvider } from './admin/dashboard/hooks/AuthContext';
import PrivateRoute from './admin/PrivateRoute';
import Login from './admin/dashboard/Login';
import HeroPageEditor from './admin/hero/HeroPageEditor';
import AdminDashboard from './admin/dashboard/AdminDashboard';
import AdminLayout from './admin/AdminLayout';
import AnnouncementEditor from './admin/announcement/AnnouncementEditor';
import { initializeProducts, products } from './data/products';
import { ThemeProvider } from '../src/utils/context/theme-context';
import NotFound from './pages/NotFound';

const COOKIE_CONSENT_NAME = 'cookie_consent';

// Load Google Analytics dynamically
const loadGoogleAnalytics = () => {
  if ((window as any).gtag) return; // already loaded

  const GA_KEY = import.meta.env.VITE_GA_KEY;
  if (!GA_KEY) {
    console.warn('Google Analytics key is missing!');
    return;
  }

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_KEY}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_KEY}');
  `;
  document.head.appendChild(script2);
};

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const [productsInitialized, setProductsInitialized] = useState(false);

  // Initialize products
  useEffect(() => {
    initializeProducts(t);
    setProductsInitialized(true);
  }, [t]);

  // Load GA if consent already given
  useEffect(() => {
    const consent = Cookies.get(COOKIE_CONSENT_NAME);
    if (consent === 'accepted') {
      loadGoogleAnalytics();
    }
  }, []);

  // Track SPA pageviews (Firebase + GA)
  useEffect(() => {
    if ((window as any).gtag && Cookies.get(COOKIE_CONSENT_NAME) === 'accepted') {
      (window as any).gtag('event', 'page_view', { page_path: location.pathname });
    }
  }, [location.pathname]);


  // Scroll behavior for homepage
  useEffect(() => {
    if (location.pathname === '/') {
      const scrollToId = location.state?.scrollToId;
      if (scrollToId) {
        setTimeout(() => {
          const section = document.getElementById(scrollToId);
          if (section) {
            const yOffset = 20;
            const y = section.getBoundingClientRect().top + window.pageYOffset - yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location]);

  if (!productsInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <ScrollToTop />
      <ConfiguratorProvider products={products}>
        <Routes>
          <Route
            element={
              <ThemeProvider>
                <HeaderProvider>
                  <div className="min-h-screen bg-white dark:bg-gray-900 flex transition-colors duration-500">
                    <main className="flex-grow transition-all duration-500 ease-in-out no-horizontal-overflow w-full max-w-[100vw]">
                      <Outlet />
                      <Footer />
                    </main>
                    <CookieBanner />
                    <ChatWidget open={chatOpen} setOpen={setChatOpen} />
                  </div>
                </HeaderProvider>
              </ThemeProvider>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/order/:id" element={<OrderNow />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/downloads" element={<FileDownloadPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<ArticleDetail />} />
            <Route path="/configurator" element={<Configurator products={products} />} />
            <Route path="/login" element={<Login />} />
             <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            element={
              <PrivateRoute>
                <ThemeProvider>
                  <AdminLayout>
                    <Outlet />
                  </AdminLayout>
                </ThemeProvider>
              </PrivateRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/blogedit" element={<BlogPostEditor />} />
            <Route path="/heroedit" element={<HeroPageEditor />} />
            <Route path="/announcementedit" element={<AnnouncementEditor />} />
          </Route>
        </Routes>

        <Toaster />
      </ConfiguratorProvider>
    </AuthProvider>
  );
}

export default App;
