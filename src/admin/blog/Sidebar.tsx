import { useState } from 'react';
import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiPlus, FiClock, FiCalendar, FiFilter, FiChevronRight } from 'react-icons/fi';

interface SidebarProps {
  articles: Array<Article & { displayTitle: string }>;
  selectedArticleId: string | null;
  onSelectArticle: (article: Article) => void;
  onCreateNew: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  sortOption: string;
  onSortOptionChange: (option: string) => void;
  isLoading: boolean;
  language: 'en' | 'de';
  onLanguageChange: (lang: 'en' | 'de') => void;
}

const Sidebar = ({
  articles,
  selectedArticleId,
  onSelectArticle,
  onCreateNew,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  sortOption,
  onSortOptionChange,
  isLoading,
  language,
  onLanguageChange,
}: SidebarProps) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-xl font-bold">{t('blogEdit.articles')}</h2>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md bg-gray-100"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
        {/* Language Selector */}
        <div className="mb-4 flex justify-end">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 text-sm ${language === 'en' ? 'bg-brandblue text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('blogEdit.english')}
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('de')}
              className={`px-3 py-1 text-sm ${language === 'de' ? 'bg-brandblue text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('blogEdit.german')}
            </button>
          </div>
        </div>

        {/* Header with create button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="w-full bg-brandgreen hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold mb-6 transition-colors"
          >
            <FiPlus className="inline mr-2" />
            <span className="hidden sm:inline">{t('blogEdit.newArticle')}</span>
          </button>
        </div>

        {/* Search with icon */}
        <div className="mb-6 relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('blogEdit.searchArticles')}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandblue focus:border-transparent placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Category filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('blogEdit.category')}
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandblue focus:border-transparent"
            disabled={isLoading}
          >
            <option value="all">{t('blogEdit.allCategories')}</option>
            {Object.entries(t('blogEdit.categories', { returnObjects: true })).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Sort options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('blogEdit.sortBy')}
          </label>
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandblue focus:border-transparent"
            disabled={isLoading}
          >
            <option value="date-desc">{t('blogEdit.newestFirst')}</option>
            <option value="date-asc">{t('blogEdit.oldestFirst')}</option>
            <option value="title-asc">{t('blogEdit.titleAtoZ')}</option>
            <option value="title-desc">{t('blogEdit.titleZtoA')}</option>
            <option value="readTime-asc">{t('blogEdit.shortestFirst')}</option>
            <option value="readTime-desc">{t('blogEdit.longestFirst')}</option>
          </select>
        </div>

        {/* Article list with improved cards */}
        {/* Article list with simplified cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || categoryFilter !== 'all'
                ? t('blogEdit.noMatchingArticles')
                : t('blogEdit.noArticlesAvailable')}
            </div>
          ) : (
            articles.map((article) => (
              <article
                key={article.id}
                onClick={() => !isLoading && onSelectArticle(article)}
                className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${selectedArticleId === article.id
                    ? 'border-brandblue bg-brandblue/5 shadow-sm'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {/* Image Thumbnail */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {article.image ? (
                    <img
                      sizes="(max-width: 768px) 50vw, 25vw"
srcSet={article.image}
                   
                      alt={article.displayTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      {t('blogEdit.noImage')}
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-brandblue line-clamp-2">
                    {article.displayTitle}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <FiCalendar size={12} />
                    {new Date(article.date).toLocaleDateString()}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;