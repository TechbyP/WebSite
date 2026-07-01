import { useState, useEffect } from 'react';
import type { PublicHeroItem } from '../../utils/publicApi';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';

type NewsItem = PublicHeroItem;

interface Article {
  id: string;
  title: string;
  title_de?: string;
  language?: string;
}

interface HeroFormProps {
  item: Partial<NewsItem>;
  onSave: (item: Partial<NewsItem>) => void;
  onCancel: () => void;
  isLoading: boolean;
  onImageUpload: (file: File) => Promise<string>;
}

const HeroForm = ({ item, onSave, onCancel, isLoading, onImageUpload }: HeroFormProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<Partial<NewsItem>>(item);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLanguage] = useState<'en' | 'de'>('en');

  useEffect(() => {
    setFormData(item);
    setImagePreview(item.image || null);
    fetchArticles();
  }, [item]);

  const fetchArticles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'articles'));
      const articleList = querySnapshot.docs.map(doc => ({
        id: doc.data().id || doc.id,
        title: doc.data().title || 'Untitled',
        title_de: doc.data().title_de || doc.data().title || 'Untitled',
        language: doc.data().language || 'en',
      }));
      setArticles(articleList);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'order') {
      setFormData(prev => ({ ...prev, order: Number(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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
        setIsUploading(true);
        const imageUrl = await onImageUpload(file);
        setFormData(prev => ({ ...prev, image: imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        setImagePreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isHomeScreen =
    formData.type === 'announcement' &&
    !formData.title_en?.trim() &&
    !formData.title_de?.trim();

  // Theme-based classes
  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500';

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 p-8 rounded-xl shadow-lg ${bgClass}`}>
      <div>
        <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
          {t('heroEditor.slideType')}
        </label>
        <select
          name="type"
          value={formData.type || ''}
          onChange={handleChange}
          className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
          required
        >
          <option value="event">{t('heroEditor.event')}</option>
          <option value="product">{t('heroEditor.product')}</option>
          <option value="blog">{t('heroEditor.article')}</option>
          <option value="announcement">{t('heroEditor.homeScreen')}</option>
        </select>
      </div>

      {!isHomeScreen && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
                {t('heroEditor.title')} (English)
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en || ''}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
                required={!isHomeScreen}
              />
            </div>
            <div>
              <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
                {t('heroEditor.title')} (Deutsch)
              </label>
              <input
                type="text"
                name="title_de"
                value={formData.title_de || ''}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
                required={!isHomeScreen}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
                {t('heroEditor.excerpt')} (English)
              </label>
              <textarea
                name="excerpt_en"
                value={formData.excerpt_en || ''}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
                rows={3}
                required={!isHomeScreen}
              />
            </div>
            <div>
              <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
                {t('heroEditor.excerpt')} (Deutsch)
              </label>
              <textarea
                name="excerpt_de"
                value={formData.excerpt_de || ''}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
                rows={3}
                required={!isHomeScreen}
              />
            </div>
          </div>

          <div>
            <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
              {t('heroEditor.date')}
            </label>
            <input
              type="text"
              name="date"
              value={formData.date || ''}
              onChange={handleChange}
              placeholder={t('heroEditor.datePlaceholder')}
              className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
            />
          </div>

          <div>
            <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
              {t('heroEditor.selectBlogPost')}
            </label>
            <select
              value={selectedArticle?.id || ''}
              onChange={(e) => {
                const articleId = e.target.value;
                const article = articles.find(a => a.id === articleId);
                if (article) {
                  setSelectedArticle(article);
                  setFormData(prev => ({
                    ...prev,
                    link_en: `/blog/${article.id}`,
                    link_de: `/blog/${article.id}`,
                    cta_en: prev.cta_en?.trim() ? prev.cta_en : t('heroEditor.readMore', { lng: 'en' }),
                    cta_de: prev.cta_de?.trim() ? prev.cta_de : t('heroEditor.readMore', { lng: 'de' }),
                  }));
                }
              }}
              className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
            >
              <option value="">-- {t('heroEditor.selectBlogPost')} --</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  {selectedLanguage === 'de' ? article.title_de : article.title}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
          {t('heroEditor.backgroundImage')} {isHomeScreen ? `(${t('heroEditor.required')})` : ''}
        </label>
        <label
          className={`block w-full bg-brandblue hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-center cursor-pointer transition-colors ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          {isUploading ? t('heroEditor.uploading') : t('heroEditor.selectImage')}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            required={isHomeScreen}
            disabled={isLoading}
          />
        </label>
        {isUploading && <p className="text-sm text-gray-400 mt-2">{t('heroEditor.uploadingImage')}</p>}
        {imagePreview && (
          <div className="mt-4">
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
              srcSet={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
          </div>
        )}
      </div>

      <div>
        <label className={`block text-lg font-black uppercase mb-2 ${textClass}`}>
          {t('heroEditor.displayOrder')}
        </label>
        <input
          type="number"
          name="order"
          value={formData.order || 0}
          onChange={handleChange}
          className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent ${borderClass} ${inputBgClass}`}
          min="0"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
          disabled={isLoading}
        >
          {t('heroEditor.cancel')}
        </button>
        <button
          type="submit"
          className="bg-brandgreen hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
          disabled={isLoading || (isHomeScreen && !formData.image)}
        >
          {isLoading ? t('heroEditor.saving') : t('heroEditor.saveSlide')}
        </button>
      </div>
    </form>
  );
};

export default HeroForm;
