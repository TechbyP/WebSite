import { Article } from './types/articles';
import { useTranslation } from 'react-i18next';
import { formatContentForDisplay } from '../formatting';
import { Clock } from 'lucide-react';

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
  const currentTitle = currentContent.title || 'Untitled';
  const categoryLabel = t(`blog.categories.${article.category}`, {
    defaultValue: t(`blogEdit.categories.${article.category}`),
  });
  const parsedDate = new Date(article.date);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? article.date
    : new Intl.DateTimeFormat(language, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(parsedDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button
          onClick={onEdit}
          className="rounded-lg bg-brandblue px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {t('blogEdit.edit')}
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {t('blogEdit.delete')}
        </button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/80">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[460px]">
            {article.image ? (
              <img
                sizes="(max-width: 1024px) 100vw, 55vw"
                srcSet={article.image}
                alt={currentTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {t('blogEdit.noImage')}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent dark:from-black/80 dark:via-black/35 dark:to-transparent"></div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-brandblue dark:bg-gray-800 dark:text-blue-300">
                  {categoryLabel}
                </span>
                {article.date && <span>{formattedDate}</span>}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime || '-'}
                </span>
                {article.featured && (
                  <span className="rounded-full bg-brandgreen px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    {t('blog.labels.featured')}
                  </span>
                )}
                {article.trending && (
                  <span className="rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white dark:bg-white/15">
                    {t('blog.labels.trending')}
                  </span>
                )}
              </div>

              <h2 className="text-4xl font-black uppercase leading-tight text-slate-950 dark:text-gray-100 md:text-5xl">
                {currentTitle}
              </h2>

              {currentContent.excerpt && (
                <p className="mt-5 text-base font-black leading-7 text-slate-600 dark:text-gray-300">
                  {currentContent.excerpt}
                </p>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-gray-800">
              <div className="flex min-w-0 items-center gap-4">
                {article.author.avatar && (
                  <img
                    sizes="64px"
                    srcSet={article.author.avatar}
                    alt={article.author.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-gray-800"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-slate-950 dark:text-gray-100">{article.author.name}</p>
                  <p className="truncate text-sm font-black uppercase tracking-wide text-slate-400 dark:text-gray-500">{article.author.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/80 sm:p-8 lg:p-10">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {formatContentForDisplay(currentContent.content)}
        </div>
      </section>
    </div>
  );
};

export default ArticleView;
