import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import { formatContentForDisplay } from '../formatting';
import { useTheme } from '../../utils/context/theme-context';

interface ArticleViewProps {
  article: Article;
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
  language: 'en' | 'de';
}

const ArticleView = ({ article, onEdit, onDelete, isLoading, language }: ArticleViewProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentContent = article.content[language] || article.content.en;

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transition-colors duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-gray-100">
            {currentContent.title}
          </h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900 px-3 py-1 rounded-full uppercase">
              {t(`blogEdit.categories.${article.category}`)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('blogEdit.readTime', { time: article.readTime })}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="bg-brandblue hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {t('blogEdit.edit')}
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {t('blogEdit.delete')}
          </button>
        </div>
      </div>

      {article.image && (
        <div className="mb-8">
          <img
            sizes="(max-width: 768px) 50vw, 25vw"
            srcSet={article.image}
            alt={currentContent.title}
            className="w-full h-96 object-cover rounded-xl shadow-md transition-colors duration-300"
          />
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {t('blogEdit.excerpt')}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{currentContent.excerpt}</p>
      </div>

      <div className="prose max-w-none dark:prose-invert mb-8">
        {formatContentForDisplay(currentContent.content)}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-gray-100 mb-4">
          {t('blogEdit.author')}
        </h3>
        <div className="flex items-center">
          {article.author.avatar && (
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
              srcSet={article.author.avatar}
              alt={article.author.name}
              className="w-16 h-16 rounded-full mr-4 border-4 border-brandblue"
            />
          )}
          <div>
            <p className="font-bold text-xl text-gray-900 dark:text-gray-100">{article.author.name}</p>
            <p className="text-brandblue font-medium">{article.author.role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {t('blogEdit.publishedOn')} {new Date(article.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ArticleView;
