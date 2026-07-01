import React, { useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/pictures/Logo-Symbol.png';
import logoFallback from '../assets/pictures/Logo-Symbol.png';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { submitNewsletterSignup } from '../utils/publicApi';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goToId = (id: string) => {
    navigate(`/?id=${id}`, { state: { scrollToId: id } });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error(t('foot.errors.invalidEmail'));
      return;
    }
    setIsLoading(true);
    try {
      await submitNewsletterSignup({ email, source: 'footer_signup', honeypot });
      toast.dismiss();
      toast.success(t('foot.newsletter.success'));
      setEmail('');
      setHoneypot('');
    } catch {
      toast.error(t('foot.errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">

          {/* Newsletter & Contact */}
          <div>
            <div className="flex items-center mb-4 cursor-pointer" onClick={() => goToId('Hero')}>
              <span className="ml-2 text-4xl font-black uppercase flex items-center">
                <img
                  sizes="44px"
                  src={logoFallback}
                  srcSet={logo}
                  alt={t('foot.alt.logo')}
                  width={700}
                  height={724}
                  className="h-[1.25em] w-auto mr-2"
                  decoding="async"
                />
                TechByP
              </span>
            </div>
            <p className="text-gray-400 mb-4">{t('foot.footer.tagline')}</p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm">{t('foot.footer.contact.location')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-sm">{t('foot.footer.contact.phone')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-sm">{t('foot.footer.contact.email')}</span>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-black mb-3 text-white">{t('foot.newsletter.title')}</h3>
              <p className="text-gray-400 mb-3 text-sm">{t('foot.newsletter.description')}</p>
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                <input
                  type="text"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  className="hidden"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('foot.newsletter.placeholder')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandgreen text-white placeholder-gray-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brandgreen hover:bg-brandblue text-white py-2 rounded-lg font-black transition-colors flex items-center justify-center"
                >
                  {isLoading ? t('foot.newsletter.subscribing') : t('foot.newsletter.subscribe')}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">{t('foot.newsletter.note')}</p>
            </div>
          </div>

          {/* Dirt Tools */}
          <div className="flex flex-col items-start text-left sm:items-end sm:text-right">
            <h3 className="text-base uppercase tracking-wide font-black text-xl mb-4 text-white">{t('foot.dirtTools.title')}</h3>
            <ul className="space-y-2 w-full">
              <li>
                <button
                  onClick={() => goToId('products')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.dirtTools.manualProbes')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToId('products')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.dirtTools.smartSystems')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToId('products')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.dirtTools.accessories')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.dirtTools.customSolutions')}
                </button>
              </li>
            </ul>

            {/* Support */}
            <h3 className="text-base uppercase tracking-wide font-black text-xl mt-6 mb-4 text-white">{t('foot.support.title')}</h3>
            <ul className="space-y-2 w-full">
              <li>
                <button
                  onClick={() => navigate('/downloads?category=all')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.support.downloadCenter')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/downloads?category=manuals')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.support.userManuals')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.support.techSupport')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.support.training')}
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col items-start text-left sm:items-end sm:text-right">
            <h3 className="text-base uppercase tracking-wide font-black text-xl mb-4 text-white">{t('foot.company.title')}</h3>
            <ul className="space-y-2 w-full">
              <li>
                <button
                  onClick={() => goToId('about')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.company.aboutUs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/blog')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.company.news')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.company.contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.company.privacyPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
                >
                  {t('foot.company.terms')}
                </button>
              </li>

              <li>   <button
                onClick={() => navigate('/imprint')}
                className="text-sm text-left sm:text-right text-gray-400 hover:text-white transition-colors w-full"
              >
                {t('foot.company.imprint')}
              </button></li>
            </ul>

            <div className="flex items-center justify-end mt-6 space-x-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label={t('foot.social.facebook')} className="hover:text-brandgreen">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/techbyp.international/" target="_blank" rel="noopener noreferrer" aria-label={t('foot.social.instagram')} className="hover:text-brandgreen">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/company/techbyp" target="_blank" rel="noopener noreferrer" aria-label={t('foot.social.linkedin')} className="hover:text-brandgreen">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="https://www.youtube.com/@TechbyP/featured" target="_blank" rel="noopener noreferrer" aria-label={t('foot.social.youtube')} className="hover:text-brandgreen">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mt-8" />

        <p className="text-center text-gray-500 mt-6 text-xs">
          {t('foot.footer.rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;