import { useState, useEffect } from 'react';
import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import RichTextEditor from './RichTextEditor';
import AvatarImage from '../../assets/pictures/Logo-Symbol.png';

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

  const handleInputChange = (field: keyof ArticleContent, value: string) => {
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
          content: content, // This now matches the expected array structure
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

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-black uppercase text-gray-900 mb-6">
        {article.id ? t('blogEdit.edit') : t('blogEdit.newArticle')}
      </h2>

      <div className="mb-6 flex space-x-4">
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t('blogEdit.english')}
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('de')}
          className={`px-4 py-2 rounded ${language === 'de' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t('blogEdit.german')}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.title')}
            </label>
            <input
              type="text"
              value={formData.content?.[language]?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.excerpt')}
            </label>
            <textarea
              value={formData.content?.[language]?.excerpt || ''}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.content')}
            </label>
            <RichTextEditor
              content={formData.content?.[language]?.content || ['']}
              onChange={handleContentChange}
              onImageUpload={onImageUpload}
              language={language}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.authorName')}
            </label>
            <input
              type="text"
              value={formData.author?.name || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  author: {
                    ...prev.author,
                    name: e.target.value,
                  },
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.authorRole')}
            </label>
            <input
              type="text"
              value={formData.author?.role || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  author: {
                    ...prev.author,
                    role: e.target.value,
                  },
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.date')}
            </label>
            <input
              type="date"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  date: new Date(e.target.value).toISOString(),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.readTime')}
            </label>
            <input
              type="text"
              value={formData.readTime || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  readTime: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.category')}
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.entries(t('blogEdit.categories', { returnObjects: true })).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.articleImage')}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!imageFile || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {t('blogEdit.uploadFile')}
              </button>
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
srcSet={imageUrl}
                
                  alt="Article preview"
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">{t('blogEdit.orPasteUrl')}</p>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setFormData(prev => ({ ...prev, image: e.target.value }));
              }}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('blogEdit.authorAvatar')}
            </label>
            <div className="flex items-center space-x-4 mb-2">
              <input
                type="file"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={!avatarFile || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {t('blogEdit.uploadFile')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl(AvatarImage);
                  setFormData(prev => ({
                    ...prev,
                    author: {
                      ...prev.author,
                      avatar: AvatarImage
                    }
                  }));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                {t('blogEdit.useDefault')}
              </button>
            </div>
            {avatarUrl && (
              <div className="mb-2">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
srcSet={avatarUrl}
                  
                  alt="Author avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">{t('blogEdit.orPasteUrl')}</p>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  author: {
                    ...prev.author,
                    avatar: e.target.value,
                  },
                }));
              }}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t('blogEdit.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? t('saving') : t('blogEdit.saveArticle')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;