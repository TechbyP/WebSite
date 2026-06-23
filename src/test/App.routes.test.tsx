import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../pages/Header', () => ({
  HeaderProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../pages/Footer.js', () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock('../utils/ScrollToTop', () => ({
  default: () => null,
}));

vi.mock('../components/CookieBanner', () => ({
  default: () => null,
}));

vi.mock('../components/chatWidget/ChatWidgetLoader', () => ({
  default: () => null,
}));

vi.mock('../utils/analytics', () => ({
  ANALYTICS_CONSENT_EVENT: 'analytics-consent-changed',
  disableAnalytics: vi.fn(),
  enableAnalytics: vi.fn().mockResolvedValue(true),
  hasAnalyticsConsent: vi.fn(() => false),
  trackPageView: vi.fn(),
}));

vi.mock('../pages/HomePageRoute', () => ({
  default: () => <div>Home Route</div>,
}));

vi.mock('../pages/ProductDetailRoute', () => ({
  default: () => <div>Product Detail Route</div>,
}));

vi.mock('../pages/OrderNowPage', () => ({
  default: () => <div>Order Route</div>,
}));

vi.mock('../pages/Contact', () => ({
  default: () => <div>Contact Route</div>,
}));

vi.mock('../pages/PrivacyPolicy', () => ({
  default: () => <div>Privacy Route</div>,
}));

vi.mock('../pages/TermsOfService', () => ({
  default: () => <div>Terms Route</div>,
}));

vi.mock('../pages/Imprint', () => ({
  default: () => <div>Imprint Route</div>,
}));

vi.mock('../pages/Downloads', () => ({
  default: () => <div>Downloads Route</div>,
}));

vi.mock('../pages/BlogList', () => ({
  default: () => <div>Blog Route</div>,
}));

vi.mock('../pages/ArticleDetail', () => ({
  default: () => <div>Article Detail Route</div>,
}));

vi.mock('../pages/ConfiguratorPage', () => ({
  default: () => <div>Configurator Route</div>,
}));

vi.mock('../admin/AdminLoginRoute', () => ({
  default: () => <div>Admin Login Route</div>,
}));

vi.mock('../admin/AdminShell', () => ({
  default: () => <div>Admin Shell</div>,
}));

vi.mock('../admin/dashboard/AdminDashboard', () => ({
  default: () => <div>Admin Dashboard</div>,
}));

vi.mock('../admin/blog/BlogPostEditor', () => ({
  default: () => <div>Blog Editor</div>,
}));

vi.mock('../admin/hero/HeroPageEditor', () => ({
  default: () => <div>Hero Editor</div>,
}));

vi.mock('../admin/announcement/AnnouncementEditor', () => ({
  default: () => <div>Announcement Editor</div>,
}));

vi.mock('../pages/NotFound', () => ({
  default: () => <div>Not Found Route</div>,
}));

const renderRoute = (entry: string) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[entry]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('App routes', () => {
  it('renders the home route', async () => {
    renderRoute('/');
    expect(await screen.findByText('Home Route')).toBeInTheDocument();
  });

  it('renders the contact route', async () => {
    renderRoute('/contact');
    expect(await screen.findByText('Contact Route')).toBeInTheDocument();
  });

  it('renders the product detail route', async () => {
    renderRoute('/product/1000');
    expect(await screen.findByText('Product Detail Route')).toBeInTheDocument();
  });

  it('renders the blog route', async () => {
    renderRoute('/blog');
    expect(await screen.findByText('Blog Route')).toBeInTheDocument();
  });
});