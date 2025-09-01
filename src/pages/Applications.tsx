import React from 'react';
import { motion } from 'framer-motion';
import { Wheat, Building, Microscope, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/context/theme-context';

const Applications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const applications = [
    {
      icon: <Wheat className="h-8 w-8" />,
      title: t('application.applications.agriculture.title'),
      description: t('application.applications.agriculture.description'),
      features: t('application.applications.agriculture.features', { returnObjects: true }),
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: t('application.applications.geotechnicalSurvey.title'),
      description: t('application.applications.geotechnicalSurvey.description'),
      features: t('application.applications.geotechnicalSurvey.features', { returnObjects: true }),
    },
    {
      icon: <Microscope className="h-8 w-8" />,
      title: t('application.applications.environmentalResearch.title'),
      description: t('application.applications.environmentalResearch.description'),
      features: t('application.applications.environmentalResearch.features', { returnObjects: true }),
    },
    {
      icon: <Hammer className="h-8 w-8" />,
      title: t('application.applications.construction.title'),
      description: t('application.applications.construction.description'),
      features: t('application.applications.construction.features', { returnObjects: true }),
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Helper function to get theme classes
  const getThemeClass = (lightClass, darkClass) => {
    return theme === 'dark' ? darkClass : lightClass;
  };

  return (
    <section className={`py-20 ${getThemeClass('bg-white', 'bg-gray-900')}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            id="applications" 
            className={`text-3xl md:text-5xl font-black uppercase mb-4 ${
              getThemeClass('text-black', 'text-white')
            }`}
          >
            {t('application.heading')}
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${
            getThemeClass('text-gray-600', 'text-gray-300')
          }`}>
            {t('application.subheading')}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {applications.map((app, index) => (
            <motion.div
              key={index}
              variants={item}
              className={`group p-8 rounded-xl transition-colors duration-300 ${
                getThemeClass(
                  'bg-gray-50 hover:bg-blue-50',
                  'bg-gray-800 hover:bg-gray-700'
                )
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
                  getThemeClass(
                    'bg-brandblue text-white group-hover:bg-blue-900',
                    'bg-blue-700 text-white group-hover:bg-blue-600'
                  )
                }`}>
                  {app.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    getThemeClass('text-gray-900', 'text-white')
                  }`}>
                    {app.title}
                  </h3>
                  <p className={`mb-4 ${
                    getThemeClass('text-gray-600', 'text-gray-300')
                  }`}>
                    {app.description}
                  </p>
                  <ul className="space-y-2">
                    {app.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex} 
                        className={`flex items-center text-sm ${
                          getThemeClass('text-gray-600', 'text-gray-300')
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          getThemeClass('bg-brandblue', 'bg-blue-500')
                        }`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className={`inline-flex items-center px-6 py-3 border rounded-lg ${
            getThemeClass(
              'border-gray-200 text-gray-600',
              'border-gray-700 text-gray-300'
            )
          }`}>
            <span className="mr-2">{t('application.customSolutionPrompt')}</span>
            <button
              onClick={() => navigate('/contact')}
              className={`font-medium ${
                getThemeClass(
                  'text-blue-600 hover:text-blue-700',
                  'text-blue-400 hover:text-blue-300'
                )
              }`}
            >
              {t('application.contactButton')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Applications;