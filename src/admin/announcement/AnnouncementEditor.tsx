import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

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

// Helper function to ensure announcement data has the correct structure
const normalizeAnnouncementData = (data: any): AnnouncementData => {
  const defaultContent = {
    tag: '',
    title: '',
    subtitle: '',
    description: '',
    dateInfo: '',
    location: '',
    ctaPrimary: '',
    ctaSecondary: '',
  };

  return {
    id: data.id || '',
    content: {
      en: data.content?.en || defaultContent,
      de: data.content?.de || defaultContent,
    },
    ctaPrimaryLink: data.ctaPrimaryLink || '',
    ctaSecondaryLink: data.ctaSecondaryLink || '',
    imageUrl: data.imageUrl || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    showDelay: data.showDelay || 3000,
    priority: data.priority || 1,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  };
};

const AnnouncementEditor = () => {
  const { t, i18n } = useTranslation();
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementData>({
    id: '',
    content: {
      en: {
        tag: 'EVENT ANNOUNCEMENT',
        title: '',
        subtitle: '',
        description: '',
        dateInfo: '',
        location: '',
        ctaPrimary: '',
        ctaSecondary: '',
      },
      de: {
        tag: 'VERANSTALTUNGSANKÜNDIGUNG',
        title: '',
        subtitle: '',
        description: '',
        dateInfo: '',
        location: '',
        ctaPrimary: '',
        ctaSecondary: '',
      }
    },
    ctaPrimaryLink: '',
    ctaSecondaryLink: '',
    imageUrl: '',
    isActive: true,
    showDelay: 3000,
    priority: 1,
    createdAt: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'de'>('en');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'announcements'));
        const announcementsData: AnnouncementData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          announcementsData.push(normalizeAnnouncementData({ ...data, id: doc.id }));
        });
        setAnnouncements(announcementsData.sort((a, b) => b.priority - a.priority));
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast.error(t('editor.loadError'));
      }
    };

    fetchAnnouncements();
  }, [t]);

  const uploadImage = async (file: File) => {
    setIsLoading(true);

    try {
      const reader = new FileReader();
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Image);

      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Image upload failed');
      }

      return data.data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const imageUrl = await uploadImage(file);
        setCurrentAnnouncement(prev => ({
          ...prev,
          imageUrl
        }));
        toast.success(t('editor.imageUploadSuccess'));
      } catch (error) {
        console.error('Error uploading image:', error);
        setImagePreview(null);
        toast.error(t('editor.imageUploadError'));
      }
    }
  };

  const handleRemoveImage = () => {
    setCurrentAnnouncement(prev => ({
      ...prev,
      imageUrl: ''
    }));
    setImagePreview(null);
    toast.info(t('editor.imageRemoved'));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAnnouncement(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [currentLanguage]: {
          ...prev.content[currentLanguage],
          [name]: value
        }
      }
    }));
  };

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAnnouncement(prev => ({
      ...prev,
      [name]: name === 'priority' || name === 'showDelay' ? parseInt(value) : value
    }));
  };

  const handleSelectAnnouncement = (id: string) => {
    const selected = announcements.find(a => a.id === id);
    if (selected) {
      setCurrentAnnouncement(normalizeAnnouncementData(selected));
      setIsNew(false);
      if (selected.imageUrl) {
        setImagePreview(selected.imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleNewAnnouncement = () => {
    setCurrentAnnouncement({
      id: '',
      content: {
        en: {
          tag: 'EVENT ANNOUNCEMENT',
          title: '',
          subtitle: '',
          description: '',
          dateInfo: '',
          location: '',
          ctaPrimary: '',
          ctaSecondary: '',
        },
        de: {
          tag: 'VERANSTALTUNGSANKÜNDIGUNG',
          title: '',
          subtitle: '',
          description: '',
          dateInfo: '',
          location: '',
          ctaPrimary: '',
          ctaSecondary: '',
        }
      },
      ctaPrimaryLink: '',
      ctaSecondaryLink: '',
      imageUrl: '',
      isActive: true,
      showDelay: 3000,
      priority: 1,
      createdAt: new Date()
    });
    setImagePreview(null);
    setIsNew(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const id = isNew ? `announcement_${Date.now()}` : currentAnnouncement.id;
      const announcementData = {
        ...currentAnnouncement,
        id,
        createdAt: new Date()
      };

      const docRef = doc(db, 'announcements', id);
      await setDoc(docRef, announcementData);

      if (isNew) {
        setAnnouncements(prev => [...prev, announcementData].sort((a, b) => b.priority - a.priority));
      } else {
        setAnnouncements(prev => prev.map(a => a.id === id ? announcementData : a).sort((a, b) => b.priority - a.priority));
      }

      toast.success(t(isNew ? 'editor.createSuccess' : 'editor.updateSuccess'));
      setIsNew(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(t(isNew ? 'editor.createError' : 'editor.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('editor.deleteConfirm'))) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        if (currentAnnouncement.id === id) {
          handleNewAnnouncement();
        }
        toast.success(t('editor.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error(t('editor.deleteError'));
      }
    }
  };

 return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Announcements List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('editor.announcements')}</h2>
          <button
            onClick={handleNewAnnouncement}
            className="w-full bg-brandgreen hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold transition-colors shadow-md hover:shadow-lg"
          >
            + {t('editor.newAnnouncement')}
          </button>

          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {announcements.map(announcement => {
              // Safely access content with fallback
              const content = announcement.content?.en || {
                title: '',
                subtitle: '',
                tag: ''
              };
              
              return (
                <motion.div
                  key={announcement.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectAnnouncement(announcement.id)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${currentAnnouncement.id === announcement.id
                    ? 'border-brandblue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{content.title}</h3>
                      <p className="text-sm text-gray-600">{content.subtitle}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${announcement.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {announcement.isActive ? t('editor.active') : t('editor.inactive')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {t('editor.priority')}: {announcement.priority}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(announcement.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      {t('editor.delete')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Announcement Editor */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isNew ? t('editor.createNew') : t('editor.editAnnouncement')}
          </h2>

          <div className="flex mb-6">
            <button
              onClick={() => setCurrentLanguage('en')}
              className={`px-4 py-2 rounded-l-lg font-medium ${currentLanguage === 'en' ? 'bg-brandblue text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              English
            </button>
            <button
              onClick={() => setCurrentLanguage('de')}
              className={`px-4 py-2 rounded-r-lg font-medium ${currentLanguage === 'de' ? 'bg-brandblue text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Deutsch
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="tag" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.tag')}</label>
                  <input
                    type="text"
                    id="tag"
                    name="tag"
                    value={currentAnnouncement.content[currentLanguage].tag}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.tagPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.title')}</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={currentAnnouncement.content[currentLanguage].title}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.titlePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="subtitle" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.subtitle')}</label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={currentAnnouncement.content[currentLanguage].subtitle}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.subtitlePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="dateInfo" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.dateInfo')}</label>
                  <input
                    type="text"
                    id="dateInfo"
                    name="dateInfo"
                    value={currentAnnouncement.content[currentLanguage].dateInfo}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.dateInfoPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.location')}</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={currentAnnouncement.content[currentLanguage].location}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.locationPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.priority')}</label>
                  <select
                    id="priority"
                    name="priority"
                    value={currentAnnouncement.priority}
                    onChange={handleCommonChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {t('editor.priorityLabel')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="ctaPrimary" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.ctaPrimary')}</label>
                  <input
                    type="text"
                    id="ctaPrimary"
                    name="ctaPrimary"
                    value={currentAnnouncement.content[currentLanguage].ctaPrimary}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.ctaPrimaryPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="ctaPrimaryLink" className="block text-lg font-semibold text-gray-900 mb-2">
                    {t('editor.ctaPrimaryLink')}
                  </label>
                  <input
                    type="url"
                    id="ctaPrimaryLink"
                    name="ctaPrimaryLink"
                    value={currentAnnouncement.ctaPrimaryLink || ''}
                    onChange={handleCommonChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.ctaPrimaryLinkPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="ctaSecondary" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.ctaSecondary')}</label>
                  <input
                    type="text"
                    id="ctaSecondary"
                    name="ctaSecondary"
                    value={currentAnnouncement.content[currentLanguage].ctaSecondary}
                    onChange={handleContentChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.ctaSecondaryPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="ctaSecondaryLink" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.ctaSecondaryLink')}</label>
                  <input
                    type="url"
                    id="ctaSecondaryLink"
                    name="ctaSecondaryLink"
                    value={currentAnnouncement.ctaSecondaryLink}
                    onChange={handleCommonChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    placeholder={t('editor.ctaSecondaryLinkPlaceholder')}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.description')}</label>
                <textarea
                  id="description"
                  name="description"
                  value={currentAnnouncement.content[currentLanguage].description}
                  onChange={handleContentChange}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-semibold text-gray-900 mb-2">{t('editor.image')}</label>
                {currentAnnouncement.imageUrl && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{t('editor.hasImage')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {t('editor.removeImage')}
                    </button>
                  </div>
                )}

                <label className={`block w-full bg-brandblue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-center cursor-pointer transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                  {isLoading ? t('editor.uploading') : currentAnnouncement.imageUrl ? t('editor.replaceImage') : t('editor.selectImage')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>

                {(imagePreview || currentAnnouncement.imageUrl) && (
                  <div className="mt-4">
                    <div className="text-md font-semibold text-gray-900 mb-2">
                      {currentAnnouncement.imageUrl && !imagePreview ? t('editor.currentImage') : t('editor.imagePreview')}
                    </div>
                    <img
                      sizes="(max-width: 768px) 50vw, 25vw"
srcSet={imagePreview || currentAnnouncement.imageUrl}
                       
                      alt="Preview"
                      className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={currentAnnouncement.isActive}
                    onChange={(e) => setCurrentAnnouncement(prev => ({
                      ...prev,
                      isActive: e.target.checked
                    }))}
                    className="h-5 w-5 text-brandblue focus:ring-brandblue border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-lg font-semibold text-gray-900">
                    {t('editor.activeAnnouncement')}
                  </label>
                </div>

                <div className="flex items-center">
                  <label htmlFor="showDelay" className="mr-2 block text-lg font-semibold text-gray-900">
                    {t('editor.showDelay')}:
                  </label>
                  <input
                    type="number"
                    id="showDelay"
                    name="showDelay"
                    value={currentAnnouncement.showDelay}
                    onChange={handleCommonChange}
                    className="w-24 p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleNewAnnouncement}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('editor.new')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-brandgreen hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
              >
                {isLoading ? t('editor.saving') : t('editor.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementEditor;