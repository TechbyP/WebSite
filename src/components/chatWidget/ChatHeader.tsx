import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Props {
  isMobile: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onClose: () => void;
}

export const ChatHeader = React.memo(({
  isMobile,
  isFullscreen,
  toggleFullscreen,
  onClose
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-brandblue to-brandgreen text-white dark:text-gray-100 p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={toggleFullscreen}
            className="text-white dark:text-gray-100 p-1 hover:text-gray-200 dark:hover:text-gray-300 transition"
            aria-label={isFullscreen ? t('chatWidget.aria.minimize') : t('chatWidget.aria.maximize')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z" />
            </svg>
          </button>
        )}
        <h3 className="text-sm font-bold tracking-wide uppercase">{t('chatWidget.title')}</h3>
      </div>

      <button
        onClick={onClose}
        className="text-white dark:text-gray-100 p-1 hover:text-gray-200 dark:hover:text-gray-300 transition"
        aria-label={t('chatWidget.aria.close')}
      >
        <FaTimes />
      </button>
    </div>
  );
});
