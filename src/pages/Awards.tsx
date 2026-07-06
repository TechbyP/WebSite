import { motion } from 'framer-motion';
import awardPhoto from '../assets/awards/DUP-Unternehmer-Award-2026.jpg';
import { useTranslation } from 'react-i18next';

interface AwardsProps {
  compact?: boolean;
}

const Awards = ({ compact = false }: AwardsProps) => {
  const { t } = useTranslation();

  const content = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-black uppercase text-gray-900 dark:text-white mb-4 tracking-tight">
          {t('awards.heading')}
        </h2>
        <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
          {t('awards.subheading')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            sizes="(max-width: 768px) 100vw, 50vw"
            srcSet={awardPhoto}
            alt={t('awards.imageAlt')}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="p-2 md:p-4"
        >
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('awards.body1')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('awards.body2')}
          </p>
        </motion.div>
      </div>
    </>
  );

  if (compact) {
    return content;
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
};

export default Awards;