import { useState, useEffect } from 'react';
import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import RichTextEditor from './RichTextEditor';
import AvatarImage from '../../assets/pictures/Logo-Symbol.png';
import { useTheme } from '../../utils/context/theme-context';

interface ArticleFormProps {
  article: Partial<Article>;
  onSave: (article: Partial<Article>) => void;
  onCancel: () => void;
  isLoading: boolean;
  onImageUpload: (file: File) => Promise<string>;
  onAvatarUpload: (file: File) => Promise<string>;
  language: 'en' | 'de';
  onLanguageChange: (lang: 'en' | 'de') => void;
}

const ArticleForm = ({
  article,
  onSave,
  onCancel,
  isLoading,
  onImageUpload,
  onAvatarUpload,
  language,
  onLanguageChange,
}: ArticleFormProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<Article>>(article);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    setFormData(article);
    setImageUrl(article.image || '');
    setAvatarUrl(article.author?.avatar || '');
  }, [article]);

  const handleInputChange = (field: keyof Article['content'], value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [language]: {
          ...prev.content?.[language],
          [field]: value,
        },
      },
    }));
  };

  const handleContentChange = (content: string[]) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [language]: {
          ...prev.content?.[language],
          content: content,
        },
      },
    }));
  };

  const handleImageUpload = async () => {
    if (imageFile) {
      try {
        const url = await onImageUpload(imageFile);
        setImageUrl(url);
        setFormData(prev => ({ ...prev, image: url }));
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (avatarFile) {
      try {
        const url = await onAvatarUpload(avatarFile);
        setAvatarUrl(url);
        setFormData(prev => ({
          ...prev,
          author: {
            ...prev.author,
            avatar: url,
          },
        }));
      } catch (error) {
        console.error('Avatar upload failed:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass =
    'w-full px-4 py-2 rounded-xl border bg-white/80 dark:bg-gray-800/80 ' +
    'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 transition';

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {article.id ? t('blogEdit.edit') : t('blogEdit.newArticle')}
      </h2>

      {/* Language Toggle */}
      <div className="mb-6 flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['en', 'de'] as const).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => onLanguageChange(lang)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              language === lang
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t(lang === 'en' ? 'blogEdit.english' : 'blogEdit.german')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Article Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('blogEdit.title')}</label>
            <input
              type="text"
              value={formData.content?.[language]?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>{t('blogEdit.category')}</label>
            <select
              value={formData.category || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, category: e.target.value }))
              }
              className={inputClass}
              required
            >
              {Object.entries(t('blogEdit.categories', { returnObjects: true })).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Excerpt & Content */}
        <div>
          <label className={labelClass}>{t('blogEdit.excerpt')}</label>
          <textarea
            value={formData.content?.[language]?.excerpt || ''}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            className={inputClass}
            rows={3}
            required
          />
        </div>

        <div>
          <label className={labelClass}>{t('blogEdit.content')}</label>
          <RichTextEditor
            content={formData.content?.[language]?.content || ['']}
            onChange={handleContentChange}
            onImageUpload={onImageUpload}
            language={language}
          />
        </div>

        {/* Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('blogEdit.authorName')}</label>
            <input
              type="text"
              value={formData.author?.name || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, author: { ...prev.author, name: e.target.value } }))
              }
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>{t('blogEdit.authorRole')}</label>
            <input
              type="text"
              value={formData.author?.role || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, author: { ...prev.author, role: e.target.value } }))
              }
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('blogEdit.date')}</label>
            <input
              type="date"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>{t('blogEdit.readTime')}</label>
            <input
              type="text"
              value={formData.readTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className={labelClass}>{t('blogEdit.articleImage')}</label>
          <div className="flex flex-col space-y-3">
            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-blue-400 transition">
              <input
                type="file"
                id="article-image"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="article-image" className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                {t('blogEdit.chooseFile')}
              </label>
            </div>
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={!imageFile || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {t('blogEdit.uploadFile')}
            </button>
            {imageUrl && (
              <img srcSet={imageUrl} alt="Article preview" className="max-h-40 rounded-lg shadow" />
            )}
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className={labelClass}>{t('blogEdit.authorAvatar')}</label>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="avatar-upload"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="avatar-upload" className="px-4 py-2 border rounded-lg cursor-pointer text-sm">
                {t('blogEdit.chooseFile')}
              </label>
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={!avatarFile || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {t('blogEdit.uploadFile')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl(AvatarImage);
                  setFormData(prev => ({ ...prev, author: { ...prev.author, avatar: AvatarImage } }));
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t('blogEdit.useDefault')}
              </button>
            </div>
            {avatarUrl && (
              <img srcSet={avatarUrl} alt="Author avatar" className="w-16 h-16 rounded-full object-cover shadow" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('blogEdit.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? t('saving') : t('blogEdit.saveArticle')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
