import { useState, useEffect } from 'react';
import { Author, RelatedArticle } from './types/articles';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import AvatarImage from '../../assets/pictures/Logo-Symbol.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import ArticleView from './ArticleView';
import ArticleForm from './ArticleForm';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

// Fixed interface definitions
interface ArticleContent {
  title: string;
  content: string[];
  excerpt: string;
}

interface FixedArticle {
  id: string;
  content: {
    en: ArticleContent;
    de: ArticleContent;
  };
  author: Author;
  date: string;
  readTime: string;
  category: string;
  image: string;
  relatedArticles: RelatedArticle[];
}

const BlogPostEditor = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [articles, setArticles] = useState<FixedArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<FixedArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  const defaultArticle: Partial<FixedArticle> = {
    id: '',
    content: {
      en: { title: '', content: [''], excerpt: '' },
      de: { title: '', content: [''], excerpt: '' }
    },
    author: { name: 'TechByP', role: 'Director of Deep Thoughts & Deeper Holes', avatar: AvatarImage },
    date: new Date().toISOString(),
    readTime: '3 min',
    category: 'technology',
    image: '',
    relatedArticles: []
  };

  const [formData, setFormData] = useState<Partial<FixedArticle>>(defaultArticle);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const articlesCollection = collection(db, 'articles');
        let q;
        switch (sortOption) {
          case 'date-asc': q = query(articlesCollection, orderBy('date', 'asc')); break;
          case 'date-desc': q = query(articlesCollection, orderBy('date', 'desc')); break;
          case 'title-asc': q = query(articlesCollection, orderBy('content.en.title', 'asc')); break;
          case 'title-desc': q = query(articlesCollection, orderBy('content.en.title', 'desc')); break;
          default: q = query(articlesCollection, orderBy('date', 'desc'));
        }
        const querySnapshot = await getDocs(q);
        const articlesData: FixedArticle[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<FixedArticle, 'id'>;
          const articleContent = data.content || {};

          const article: FixedArticle = {
            id: doc.id,
            content: {
              en: articleContent.en || { title: '', content: [''], excerpt: '' },
              de: articleContent.de || { title: '', content: [''], excerpt: '' }
            },
            author: data.author || defaultArticle.author,
            date: data.date || defaultArticle.date,
            readTime: data.readTime || defaultArticle.readTime,
            category: data.category || defaultArticle.category,
            image: data.image || defaultArticle.image,
            relatedArticles: data.relatedArticles || []
          } as FixedArticle;

          articlesData.push(article);
        });

        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchArticles();
  }, [sortOption]);

  const uploadImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
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
      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Image upload failed');
      return data.data.url;
    } catch (error) { 
      console.error('Image upload error:', error); 
      throw error; 
    } finally { 
      setIsLoading(false); 
    }
  };

  const filteredArticles = articles
    .filter(article => {
      const title = article.content?.[language]?.title || '';
      const content = article.content?.[language]?.content || [''];
      const searchLower = searchTerm.toLowerCase();
      return title.toLowerCase().includes(searchLower) || content.some(p => p.toLowerCase().includes(searchLower));
    })
    .filter(article => categoryFilter === 'all' || article.category === categoryFilter)
    .sort((a, b) => {
      switch (sortOption) {
        case 'readTime-asc': return parseInt(a.readTime) - parseInt(b.readTime);
        case 'readTime-desc': return parseInt(b.readTime) - parseInt(a.readTime);
        default: return 0;
      }
    });

  const selectArticle = (article: FixedArticle) => { 
    setSelectedArticle(article); 
    setIsEditing(false); 
    setIsCreating(false); 
  };

  const startEditing = (article: FixedArticle) => {
    setFormData({ 
      ...article, 
      content: { 
        en: article.content.en || { title: '', content: [''], excerpt: '' }, 
        de: article.content.de || { title: '', content: [''], excerpt: '' } 
      } 
    });
    setIsEditing(true); 
    setIsCreating(false); 
    setSelectedArticle(null);
  };

  const startCreating = () => { 
    setFormData(defaultArticle); 
    setIsCreating(true); 
    setIsEditing(false); 
    setSelectedArticle(null); 
  };

  const saveArticle = async (article: Partial<FixedArticle>) => {
    setIsLoading(true); 
    setError(null);
    try {
      const articleToSave: FixedArticle = {
        ...article,
        id: article.id || Date.now().toString(),
        date: article.date || new Date().toISOString(),
        content: {
          en: article.content?.en || { title: '', content: [''], excerpt: '' },
          de: article.content?.de || { title: '', content: [''], excerpt: '' }
        },
        author: article.author || defaultArticle.author,
        readTime: article.readTime || defaultArticle.readTime,
        category: article.category || defaultArticle.category,
        image: article.image || defaultArticle.image,
        relatedArticles: article.relatedArticles || []
      } as FixedArticle;

      const articleRef = doc(db, 'articles', articleToSave.id);
      await setDoc(articleRef, articleToSave);
      setArticles(prev => isCreating ? [...prev, articleToSave] : prev.map(a => a.id === articleToSave.id ? articleToSave : a));
      toast.success(isCreating ? 'Article created successfully!' : 'Article updated successfully!');
      setIsCreating(false); 
      setIsEditing(false); 
      setSelectedArticle(articleToSave);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save article');
    } finally { 
      setIsLoading(false); 
    }
  };

  const deleteArticle = async (id: string) => {
    toast.info(
      <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg">
        <h3>Are you sure you want to delete this article?</h3>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                setIsLoading(true);
                await deleteDoc(doc(db, 'articles', id));
                setArticles(prev => prev.filter(a => a.id !== id));
                if (selectedArticle?.id === id) setSelectedArticle(null);
                toast.success('Article deleted successfully!');
              } catch (error) { 
                console.error(error); 
                toast.error(error instanceof Error ? error.message : 'Failed to delete article'); 
              } finally { 
                setIsLoading(false); 
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss()} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded transition-colors">Cancel</button>
        </div>
      </div>,
      { 
        position: "top-center", 
        autoClose: false, 
        closeButton: false, 
        draggable: false, 
        closeOnClick: false, 
        theme: theme === 'dark' ? 'dark' : 'light' 
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ToastContainer theme={theme === 'dark' ? 'dark' : 'light'} />

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-400 dark:border-red-700 p-4 shadow-sm">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {isCreating || isEditing ? (
            <ArticleForm
              article={formData}
              onSave={saveArticle}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(false);
                if (formData.id) {
                  const article = articles.find(a => a.id === formData.id);
                  if (article) setSelectedArticle(article);
                }
              }}
              isLoading={isLoading}
              onImageUpload={uploadImage}
              onAvatarUpload={uploadImage}
              language={language}
              onLanguageChange={setLanguage}
            />
          ) : selectedArticle ? (
            <ArticleView
              article={selectedArticle}
              onEdit={() => startEditing(selectedArticle)}
              onDelete={() => deleteArticle(selectedArticle.id)}
              isLoading={isLoading}
              language={language}
            />
          ) : (
            <div className="p-10 rounded-2xl shadow-lg text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-extrabold mb-2">
                {articles.length === 0 ? 'No articles yet' : t('blogEdit.selectArticle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {articles.length === 0 ? t('blogEdit.wantToCreateArticle') : t('blogEdit.selectFromArticle')}
              </p>
              {articles.length > 0 && (
                <button
                  onClick={startCreating}
                  className="mt-6 px-6 py-3 rounded-xl bg-brandgreen hover:bg-green-700 text-white font-semibold shadow-md transition-colors"
                >
                  {t('blogEdit.newArticle')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          articles={filteredArticles.map(a => ({
            ...a,
            displayTitle: a.content?.[language]?.title || 'Untitled'
          }))}
          selectedArticleId={selectedArticle?.id || null}
          onSelectArticle={selectArticle}
          onCreateNew={startCreating}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          isLoading={isLoading}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </div>
  );
};

export default BlogPostEditor;