import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Globe, Users, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoSection from '../utils/VideoSection';

const About = () => {
  const { t } = useTranslation();

  // Get milestones and stats from translation files
  const milestones = t('about.milestones', { returnObjects: true });
  const stats = t('about.stats', { returnObjects: true });

  return (
    <section className="overflow-x-hidden py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span id="about" className="inline-block px-3 py-1 text-sm font-medium text-brandblue bg-blue-100 rounded-full">
            {t('about.madeInGermany')}
          </span>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-6xl font-black text-black mb-6 uppercase tracking-tight"
          >
            {t('about.engineeringExcellence')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-l text-gray-600 mb-8 leading-relaxed"
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
                  className="text-center p-4 bg-white rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-brandgreen rounded-lg mb-2">
                    {stat.icon === 'Globe' && <Globe className="h-6 w-6" />}
                    {stat.icon === 'Users' && <Users className="h-6 w-6" />}
                    {stat.icon === 'Wrench' && <Wrench className="h-6 w-6" />}
                    {stat.icon === 'Award' && <Award className="h-6 w-6" />}
                  </div>
                  <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-black text-gray-900 mb-4 uppercase">{t('about.ourMissionTitle')}</h3>
              <p className="text-gray-600">{t('about.ourMissionText')}</p>
            </motion.div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-black text-gray-900 mb-8 text-center uppercase">{t('about.ourJourneyTitle')}</h3>
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
                    <div className="flex-shrink-0 w-12 h-12 bg-brandblue text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="text-sm font-medium text-brandblue">{milestone.year}</div>
                      <div className="text-gray-900">{milestone.event}</div>
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