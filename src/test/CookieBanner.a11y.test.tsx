import Cookies from 'js-cookie';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import CookieBanner from '../components/CookieBanner';

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../utils/analytics', () => ({
  COOKIE_CONSENT_NAME: 'cookie_consent',
  setAnalyticsConsent: vi.fn(),
}));

describe('CookieBanner accessibility', () => {
  it('has no obvious accessibility violations when visible', async () => {
    localStorage.setItem('i18nextLng', 'en');
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    const { container } = render(
      <MemoryRouter>
        <CookieBanner />
      </MemoryRouter>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});