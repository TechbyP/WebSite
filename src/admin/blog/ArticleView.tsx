import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import { formatContentForDisplay } from '../formatting';

interface ArticleViewProps {
  article: Article;
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
  language: 'en' | 'de';
}

const ArticleView = ({ article, onEdit, onDelete, isLoading, language }: ArticleViewProps) => {
  const { t } = useTranslation();
  const currentContent = article.content[language] || article.content.en;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase text-gray-900">{currentContent.title}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">
              {t(`blogEdit.categories.${article.category}`)}
            </span>
            <span className="text-sm text-gray-500">
              {t('blogEdit.readTime', { time: article.readTime })}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="bg-brandblue hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            disabled={isLoading}
          >
            {t('blogEdit.edit')}
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            disabled={isLoading}
          >
            {t('blogEdit.delete')}
          </button>
        </div>
      </div>

      {article.image && (
        <div className="mb-8">
          <img
            src={article.image}
            alt={currentContent.title}
            className="w-full h-96 object-cover rounded-xl shadow-md"
          />
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{t('blogEdit.excerpt')}</h3>
        <p className="text-gray-700">{currentContent.excerpt}</p>
      </div>

      <div className="prose max-w-none text-lg text-gray-700 mb-8">
        {formatContentForDisplay(currentContent.content)}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <h3 className="text-2xl font-black uppercase text-gray-900 mb-4">{t('blogEdit.author')}</h3>
        <div className="flex items-center">
          {article.author.avatar && (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-16 h-16 rounded-full mr-4 border-4 border-brandblue"
            />
          )}
          <div>
            <p className="font-bold text-xl text-gray-900">{article.author.name}</p>
            <p className="text-brandblue font-medium">{article.author.role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {t('blogEdit.publishedOn')} {new Date(article.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ArticleView;