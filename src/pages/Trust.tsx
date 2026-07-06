import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import Awards from "./Awards";

type Testimonial = {
  rating: number;
  quote: string;
  author: string;
  position: string;
};

const Trust = () => {
  const { t } = useTranslation();

  const partners = t('partners', { returnObjects: true }) as string[];
  const testimonials = t('testimonials', { returnObjects: true }) as Testimonial[];

  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Partners Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 uppercase tracking-tight transition-colors duration-300">
            {t('partnersHeader.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">
            {t('partnersHeader.description')}
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-16"
        >
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 py-3 px-2 rounded-md shadow-sm dark:shadow-gray-700/20 flex items-center justify-center h-16 transition-all duration-300 hover:shadow-md hover:dark:shadow-gray-700/30"
            >
              {partner}
            </motion.div>
          ))}
        </motion.div>

        <div className="mb-16">
          <Awards compact />
        </div>

        {/* Testimonials Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 uppercase tracking-tight transition-colors duration-300">
            {t('testimonialsHeader.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">
            {t('testimonialsHeader.description')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((tst, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-md dark:shadow-gray-700/20 flex flex-col transition-all duration-300 hover:shadow-lg hover:dark:shadow-gray-700/30"
            >
              <Quote className="text-blue-600 dark:text-blue-400 mb-4 h-6 w-6 sm:h-8 sm:w-8 transition-colors duration-300" />
              <div className="flex items-center mb-4">
                {[...Array(tst.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-sm sm:text-base flex-grow transition-colors duration-300">
                "{tst.quote}"
              </p>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{tst.author}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{tst.position}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Trust;