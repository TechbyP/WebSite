import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Globe, Users, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoSection from '../utils/VideoSection';
import { useTheme } from '../utils/context/theme-context';

const About = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Get milestones and stats from translation files
  const milestones = t('about.milestones', { returnObjects: true });
  const stats = t('about.stats', { returnObjects: true });

  // Helper function to get theme classes
  const getThemeClasses = (lightClass, darkClass) => {
    return theme === 'dark' ? darkClass : lightClass;
  };

  return (
    <section className={`overflow-x-hidden py-20 ${getThemeClasses('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span 
            id="about" 
            className={`inline-block px-3 py-1 text-sm font-medium ${getThemeClasses(
              'text-brandblue bg-blue-100',
              'text-blue-300 bg-blue-900'
            )} rounded-full`}
          >
            {t('about.madeInGermany')}
          </span>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-3xl md:text-6xl font-black ${getThemeClasses('text-black', 'text-white')} mb-6 uppercase tracking-tight`}
          >
            {t('about.engineeringExcellence')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`text-l ${getThemeClasses('text-gray-600', 'text-gray-300')} mb-8 leading-relaxed`}
          >
            {t('about.introText')}
          </motion.p>
        </div>
      </div>

      {/* video */}
      <section id="demo" className="mt-12 mb-12">
        <VideoSection
          videoId="LPMvf_oIJ3U"
          posterSrc="https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          title={t('about.alwaysImproving')}
        />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="grid grid-cols-2 gap-6 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.15 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={`text-center p-4 ${getThemeClasses(
                    'bg-white shadow-sm',
                    'bg-gray-800 shadow-gray-800/30'
                  )} rounded-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${
                    getThemeClasses('bg-blue-100 text-brandgreen', 'bg-blue-900 text-blue-300')
                  } rounded-lg mb-2`}>
                    {stat.icon === 'Globe' && <Globe className="h-6 w-6" />}
                    {stat.icon === 'Users' && <Users className="h-6 w-6" />}
                    {stat.icon === 'Wrench' && <Wrench className="h-6 w-6" />}
                    {stat.icon === 'Award' && <Award className="h-6 w-6" />}
                  </div>
                  <div className={`text-2xl font-black ${getThemeClasses('text-gray-900', 'text-white')}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${getThemeClasses('text-gray-600', 'text-gray-300')}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className={`p-6 rounded-lg ${getThemeClasses(
                'bg-white shadow-sm',
                'bg-gray-800 shadow-gray-800/30'
              )}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className={`text-lg font-black ${getThemeClasses('text-gray-900', 'text-white')} mb-4 uppercase`}>
                {t('about.ourMissionTitle')}
              </h3>
              <p className={getThemeClasses('text-gray-600', 'text-gray-300')}>
                {t('about.ourMissionText')}
              </p>
            </motion.div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={`p-8 rounded-xl ${getThemeClasses(
              'bg-white shadow-lg',
              'bg-gray-800 shadow-gray-800/30'
            )}`}>
              <h3 className={`text-2xl font-black ${getThemeClasses('text-gray-900', 'text-white')} mb-8 text-center uppercase`}>
                {t('about.ourJourneyTitle')}
              </h3>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 ${
                      getThemeClasses('bg-brandblue', 'bg-blue-700')
                    } text-white rounded-full flex items-center justify-center font-semibold text-sm`}>
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className={`text-sm font-medium ${
                        getThemeClasses('text-brandblue', 'text-blue-300')
                      }`}>
                        {milestone.year}
                      </div>
                      <div className={getThemeClasses('text-gray-900', 'text-white')}>
                        {milestone.event}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;