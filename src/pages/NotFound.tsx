import React from "react";
import { motion } from "framer-motion";
import { Compass, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6 max-w-2xl"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="mx-auto mb-8 flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-800"
        >
          <AlertTriangle className="w-12 h-12 text-blue-600 dark:text-blue-300" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
          {t('notFound.title')}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t('notFound.description.line1')}
          <br />
          {t('notFound.description.line2')}
        </p>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-colors duration-300"
          >
            <Compass className="w-5 h-5" />
            {t('notFound.backButton')}
          </Link>
        </motion.div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 italic">
          {t('notFound.footer')}
        </p>
      </motion.div>
    </section>
  );
};

export default NotFound;