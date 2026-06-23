import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ConfiguratorPage from '../pages/ConfiguratorPage';
import OrderNowPage from '../pages/OrderNowPage';

vi.mock('../components/configurator/Configurator', () => ({
  Configurator: () => <div>Configurator UI</div>,
}));

vi.mock('../components/configurator/contexts/ConfiguratorContext', () => ({
  ConfiguratorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useConfigurator: () => ({
    startWithProduct: vi.fn(),
  }),
}));

vi.mock('../data/context/ProductsContext', () => ({
  ProductsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProducts: () => ({
    products: [],
    getProductById: () => ({ id: 1000, name: 'MP-190' }),
  }),
}));

vi.mock('../components/OrderNow', () => ({
  default: () => <div>Order modal</div>,
}));

describe('Public route metadata', () => {
  it('sets SEO metadata on configurator route', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/configurator']}>
          <ConfiguratorPage />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toContain('TECHBYP');
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.techbyp.com/configurator');
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    });
  });

  it('keeps transactional order route noindex with canonical URL', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/order/1000']}>
          <Routes>
            <Route path="/order/:id" element={<OrderNowPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.techbyp.com/order/1000');
    });
  });
});
