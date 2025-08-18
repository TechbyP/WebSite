import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface AnnouncementContent {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  dateInfo: string;
  location: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface AnnouncementData {
  id: string;
  content: {
    en: AnnouncementContent;
    de: AnnouncementContent;
  };
  ctaPrimaryLink?: string;
  ctaSecondaryLink: string;
  imageUrl: string;
  isActive: boolean;
  showDelay: number;
  priority: number;
  createdAt: Date;
}

const Announcement = () => {
  const { t, i18n } = useTranslation();
  const [visibleAnnouncement, setVisibleAnnouncement] = useState<AnnouncementData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAnnouncements = async () => {
      try {
        const q = query(
          collection(db, 'announcements'),
          where('isActive', '==', true),
          orderBy('priority', 'desc'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const activeAnnouncements: AnnouncementData[] = [];

        querySnapshot.forEach((doc) => {
          activeAnnouncements.push({ ...doc.data(), id: doc.id } as AnnouncementData);
        });

        if (activeAnnouncements.length > 0) {
          // Find the first announcement that hasn't been dismissed
          for (const announcement of activeAnnouncements) {
            const hasSeen = sessionStorage.getItem(`hasSeenAnnouncement_${announcement.id}`);
            if (!hasSeen) {
              setVisibleAnnouncement(announcement);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveAnnouncements();
  }, []);

  useEffect(() => {
    if (!visibleAnnouncement) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, visibleAnnouncement.showDelay || 3000);

    return () => clearTimeout(timer);
  }, [visibleAnnouncement]);

  const closeBanner = () => {
    if (visibleAnnouncement) {
      sessionStorage.setItem(`hasSeenAnnouncement_${visibleAnnouncement.id}`, 'true');
    }
    setIsVisible(false);
  };

  const handleCtaClick = (announcementId: string, ctaType: string) => {
    // Here you could track CTA clicks in your analytics system
    console.log(`CTA clicked: ${ctaType} for announcement ${announcementId}`);
  };

  if (isLoading || !visibleAnnouncement) {
    return null;
  }

  const currentContent = visibleAnnouncement.content[i18n.language as 'en' | 'de'] || 
                        visibleAnnouncement.content.en;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20  z-50 w-full max-w-md "
        >
          <div className="relative bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/85 rounded-xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
            <button
              onClick={closeBanner}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              aria-label={t('announcement.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-brandgreen bg-brandgreen/10 rounded-full">
                      {currentContent.tag}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-2">
                    {currentContent.title} <span className="text-brandgreen">{currentContent.subtitle}</span>
                  </h3>

                  {currentContent.dateInfo && (
                    <div className="flex items-center text-gray-300 text-sm mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {currentContent.dateInfo}
                    </div>
                  )}

                  {currentContent.location && (
                    <div className="flex items-center text-gray-300 text-sm mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {currentContent.location}
                    </div>
                  )}
                </div>

                <p className="text-gray-300 my-4">
                  {currentContent.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      handleCtaClick(visibleAnnouncement.id, 'primary');
                      closeBanner();
                      if (visibleAnnouncement.ctaPrimaryLink) {
                        window.open(visibleAnnouncement.ctaPrimaryLink, '_blank');
                      }
                    }}
                    className="bg-brandgreen/60 hover:bg-brandgreen border border-brandgreen/50 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center text-center"
                  >
                    {currentContent.ctaPrimary}
                  </button>

                  {currentContent.ctaSecondary && (
                    <a
                      href={visibleAnnouncement.ctaSecondaryLink}
                      onClick={() => handleCtaClick(visibleAnnouncement.id, 'secondary')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-white/30 hover:border-white/50 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center"
                    >
                      {currentContent.ctaSecondary}
                    </a>
                  )}
                </div>
              </div>

              {visibleAnnouncement.imageUrl && (
                <div className="hidden md:block w-44 relative overflow-hidden">
                  <img
                    sizes="(max-width: 768px) 50vw, 25vw"
srcSet={visibleAnnouncement.imageUrl}
                    alt="Announcement visual"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Announcement;