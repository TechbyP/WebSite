import { useState, useEffect } from 'react'
import { Article } from './types/articles'
import { db } from '../../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import AvatarImage from '../../assets/pictures/Logo-Symbol.png'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './Sidebar'
import ArticleView from './ArticleView'
import ArticleForm from './ArticleForm'
import { useTranslation } from 'react-i18next'

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY

const BlogPostEditor = () => {
  const { t } = useTranslation()
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState('date-desc')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'de'>('en')

  const defaultArticle: Partial<Article> = {
    id: '',
    content: {
      en: {
        title: '',
        content: [''],
        excerpt: ''
      },
      de: {
        title: '',
        content: [''],
        excerpt: ''
      }
    },
    author: {
      name: 'TechByP',
      role: 'Director of Deep Thoughts & Deeper Holes',
      avatar: AvatarImage
    },
    date: new Date().toISOString(),
    readTime: '3 min',
    category: 'technology',
    image: '',
    relatedArticles: []
  }

  const [formData, setFormData] = useState<Partial<Article>>(defaultArticle)

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const articlesCollection = collection(db, 'articles')
        let q

        switch (sortOption) {
          case 'date-asc':
            q = query(articlesCollection, orderBy('date', 'asc'))
            break
          case 'date-desc':
            q = query(articlesCollection, orderBy('date', 'desc'))
            break
          case 'title-asc':
            q = query(articlesCollection, orderBy('content.en.title', 'asc'))
            break
          case 'title-desc':
            q = query(articlesCollection, orderBy('content.en.title', 'desc'))
            break
          default:
            q = query(articlesCollection, orderBy('date', 'desc'))
        }

        const querySnapshot = await getDocs(q)
        const articlesData: Article[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Article
          articlesData.push({
            ...defaultArticle, // Apply defaults first
            ...data,          // Then override with actual data
            id: doc.id,
            content: {
              en: data.content?.en || defaultArticle.content?.en,
              de: data.content?.de || defaultArticle.content?.de
            }
          })
        })

        setArticles(articlesData)
      } catch (err) {
        console.error('Error fetching articles:', err)
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [sortOption])

  const uploadImage = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const formData = new FormData()
      formData.append('key', IMGBB_API_KEY)
      formData.append('image', base64Image)

      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Image upload failed')
      }

      return data.data.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const filteredArticles = articles
    .filter(article => {
      const title = article.content?.[language]?.title || ''
      const content = article.content?.[language]?.content || ['']
      const searchLower = searchTerm.toLowerCase()
      return (
        title.toLowerCase().includes(searchLower) ||
        content.some(para => para.toLowerCase().includes(searchLower))
      )
    })
    .filter(article => categoryFilter === 'all' || article.category === categoryFilter)
    .sort((a, b) => {
      switch (sortOption) {
        case 'readTime-asc':
          return parseInt(a.readTime) - parseInt(b.readTime)
        case 'readTime-desc':
          return parseInt(b.readTime) - parseInt(a.readTime)
        default:
          return 0
      }
    })

  const selectArticle = (article: Article) => {
    setSelectedArticle(article)
    setIsEditing(false)
    setIsCreating(false)
  }

  const startEditing = (article: Article) => {
    setFormData({
      ...article,
      content: {
        en: article.content.en || { title: '', content: [''], excerpt: '' },
        de: article.content.de || { title: '', content: [''], excerpt: '' }
      }
    })
    setIsEditing(true)
    setIsCreating(false)
    setSelectedArticle(null)
  }

  const startCreating = () => {
    setFormData(defaultArticle)
    setIsCreating(true)
    setIsEditing(false)
    setSelectedArticle(null)
  }

  const saveArticle = async (article: Partial<Article>) => {
    setIsLoading(true)
    setError(null)

    try {
      const articleToSave = {
        ...article,
        id: article.id || Date.now().toString(),
        date: article.date || new Date().toISOString(),
        content: {
          en: article.content?.en || { title: '', content: [''], excerpt: '' },
          de: article.content?.de || { title: '', content: [''], excerpt: '' }
        }
      } as Article

      const articleRef = doc(db, 'articles', articleToSave.id)
      await setDoc(articleRef, articleToSave)

      if (isCreating) {
        setArticles(prev => [...prev, articleToSave])
        toast.success('Article created successfully!')
      } else {
        setArticles(prev => prev.map(a =>
          a.id === articleToSave.id ? articleToSave : a
        ))
        toast.success('Article updated successfully!')
      }

      setIsCreating(false)
      setIsEditing(false)
      setSelectedArticle(articleToSave)
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save article')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteArticle = async (id: string) => {
    toast.info(
      <div>
        <h3>Are you sure you want to delete this article?</h3>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={async () => {
              toast.dismiss()
              try {
                setIsLoading(true)
                await deleteDoc(doc(db, 'articles', id))
                setArticles(prev => prev.filter(a => a.id !== id))
                if (selectedArticle?.id === id) {
                  setSelectedArticle(null)
                }
                toast.success('Article deleted successfully!')
              } catch (error) {
                console.error('Error deleting article:', error)
                toast.error(error instanceof Error ? error.message : 'Failed to delete article')
              } finally {
                setIsLoading(false)
              }
            }}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-500 text-white px-4 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        draggable: false,
        closeOnClick: false,
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {isCreating || isEditing ? (
              <ArticleForm
                article={formData}
                onSave={saveArticle}
                onCancel={() => {
                  setIsCreating(false)
                  setIsEditing(false)
                  if (formData.id) {
                    const article = articles.find(a => a.id === formData.id)
                    if (article) setSelectedArticle(article)
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
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-black uppercase text-gray-900 mb-4">
                  {articles.length === 0
                    ? 'No articles found'
                    : t('blogEdit.selectArticle')}
                </h2>
                <p className="text-gray-600">
                  {articles.length === 0
                    ? t('blogEdit.wantToCreateArticle')
                    : t('blogEdit.selectFromArticle')}
                </p>
                {articles.length > 0 && (
                  <button
                    onClick={startCreating}
                    className="mt-6 bg-brandgreen hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                  >
                    {t('blogEdit.newArticle')}
                  </button>
                )}
              </div>

            )}
          </div>
          <Sidebar
            articles={filteredArticles.map(a => ({
              ...a,
              displayTitle: a.content?.[language]?.title || ''
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
    </div>
  )
}

export default BlogPostEditor