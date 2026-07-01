import { useState, useEffect } from 'react';
import type { PublicHeroItem } from '../../utils/publicApi';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeroForm from './HeroForm';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';

type NewsItem = PublicHeroItem;

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

const HeroPageEditor = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [heroItems, setHeroItems] = useState<NewsItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultItem: Partial<NewsItem> = {
    type: 'event',
    title_en: '',
    title_de: '',
    excerpt_en: '',
    excerpt_de: '',
    image: '',
    date: '',
    link_en: '',
    link_de: '',
    cta_en: '',
    cta_de: '',
    order: 0,
    isHomeScreen: false,
  };

  const [formData, setFormData] = useState<Partial<NewsItem>>(defaultItem);

  // Helper to format titles (kept as-is)
  const formatTitle = (title: string) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 2) return title;
    const lastTwoWords = words.splice(-2).join(' ');
    const remainingWords = words.join(' ');
    return (
      <>
        {remainingWords} <br />
        <span className="text-brandgreen uppercase">{lastTwoWords}</span>
      </>
    );
  };

  useEffect(() => {
    const fetchHeroItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'heroItems'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const items: NewsItem[] = [];
        querySnapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as NewsItem);
        });
        setHeroItems(items);
      } catch (err) {
        console.error('Error fetching hero items:', err);
        setError(t('heroEditor.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroItems();
  }, [t]);

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

      const body = new FormData();
      body.append('key', IMGBB_API_KEY);
      body.append('image', base64Image);

      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
      const data = await res.json();

      if (!data.success) throw new Error(data.error?.message || 'Image upload failed');
      return data.data.url as string;
    } catch (err) {
      console.error('Image upload error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectItem = (item: NewsItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    setIsCreating(false);
  };

  const startEditing = (item: NewsItem) => {
    setFormData({ ...item });
    setIsEditing(true);
    setIsCreating(false);
    setSelectedItem(null);
  };

  const startCreating = () => {
    setFormData(defaultItem);
    setIsCreating(true);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const saveItem = async (item: Partial<NewsItem>) => {
    setIsLoading(true);
    setError(null);
    try {
      const itemToSave = {
        ...item,
        id: item.id || Date.now().toString(),
        order: item.order ?? heroItems.length,
        title_en: item.title_en || '',
        title_de: item.title_de || '',
        excerpt_en: item.excerpt_en || '',
        excerpt_de: item.excerpt_de || '',
        cta_en: item.cta_en || '',
        cta_de: item.cta_de || '',
        link_en: item.link_en || '',
        link_de: item.link_de || '',
        isHomeScreen: item.type === 'announcement' && !item.title_en,
      } as NewsItem;

      const itemRef = doc(db, 'heroItems', itemToSave.id);
      await setDoc(itemRef, itemToSave);

      if (isCreating) {
        setHeroItems((prev) => [...prev, itemToSave]);
        toast.success(t('heroEditor.createSuccess'));
      } else {
        setHeroItems((prev) => prev.map((i) => (i.id === itemToSave.id ? itemToSave : i)));
        toast.success(t('heroEditor.updateSuccess'));
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedItem(itemToSave);
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error(err instanceof Error ? err.message : t('heroEditor.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    toast.info(
      <div className={theme === 'dark' ? 'dark:bg-gray-800 dark:text-white' : ''}>
        <h3>{t('heroEditor.deleteConfirm')}</h3>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                setIsLoading(true);
                await deleteDoc(doc(db, 'heroItems', id));
                setHeroItems((prev) => prev.filter((i) => i.id !== id));
                if (selectedItem?.id === id) setSelectedItem(null);
                toast.success(t('heroEditor.deleteSuccess'));
              } catch (err) {
                console.error('Error deleting item:', err);
                toast.error(err instanceof Error ? err.message : t('heroEditor.deleteError'));
              } finally {
                setIsLoading(false);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
          >
            {t('heroEditor.delete')}
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded transition-colors"
          >
            {t('heroEditor.cancel')}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeButton: false,
        draggable: false,
        closeOnClick: false,
        theme: theme === 'dark' ? 'dark' : 'light',
      }
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        theme={theme === 'dark' ? 'dark' : 'light'}
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div
            className={`border-l-4 p-4 ${
              theme === 'dark'
                ? 'bg-red-900 border-red-700 text-red-200'
                : 'bg-red-100 border-red-500 text-red-700'
            }`}
          >
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left/main column */}
          <div className="lg:col-span-3">
            {isCreating || isEditing ? (
              <div className={`p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-3xl font-black uppercase mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {isCreating ? t('heroEditor.createSlide') : t('heroEditor.editSlide')}
                </h2>
                <HeroForm
                  item={formData}
                  onSave={saveItem}
                  onCancel={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    if (formData.id) {
                      const item = heroItems.find((i) => i.id === formData.id);
                      if (item) setSelectedItem(item);
                    }
                  }}
                  isLoading={isLoading}
                  onImageUpload={uploadImage}
                />
              </div>
            ) : selectedItem ? (
              // Selected item view (fully themed)
              <div className={`p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-3xl font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedItem.isHomeScreen
                      ? selectedItem.title_en || t('heroEditor.homeScreen')
                      : formatTitle(selectedItem.title_en) || t('heroEditor.untitledSlide')}
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => startEditing(selectedItem)}
                      className="bg-brandblue hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                      disabled={isLoading}
                    >
                      {t('heroEditor.edit')}
                    </button>
                    <button
                      onClick={() => deleteItem(selectedItem.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                      disabled={isLoading}
                    >
                      {t('heroEditor.delete')}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full ${
                      theme === 'dark'
                        ? 'text-blue-300 bg-blue-900/40'
                        : 'text-brandblue bg-blue-100'
                    }`}
                  >
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>

                {selectedItem.image && (
                  <div className="mb-8">
                    <img
                      sizes="(max-width: 768px) 50vw, 25vw"
                      srcSet={selectedItem.image}
                      alt="Slide preview"
                      className="w-full h-96 object-cover rounded-xl shadow-md"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Title (English)
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    {selectedItem.isHomeScreen ? selectedItem.title_en : formatTitle(selectedItem.title_en)}
                  </p>

                  <h3 className={`text-xl font-black uppercase mt-4 mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Title (Deutsch)
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    {selectedItem.isHomeScreen ? selectedItem.title_de : formatTitle(selectedItem.title_de)}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Excerpt (English)
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    {selectedItem.excerpt_en}
                  </p>

                  <h3 className={`text-xl font-black uppercase mt-4 mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Excerpt (Deutsch)
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    {selectedItem.excerpt_de}
                  </p>
                </div>

                {selectedItem.date && (
                  <div className="mb-6">
                    <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Date
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                      {selectedItem.date}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Link (English)
                    </h3>
                    <a
                      href={selectedItem.link_en}
                      className="text-brandblue hover:underline text-lg break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedItem.link_en}
                    </a>
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Link (Deutsch)
                    </h3>
                    <a
                      href={selectedItem.link_de}
                      className="text-brandblue hover:underline text-lg break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedItem.link_de}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Call to Action (English)
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                      {selectedItem.cta_en}
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Call to Action (Deutsch)
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                      {selectedItem.cta_de}
                    </p>
                  </div>
                </div>

                <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-black uppercase mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Display Order
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    {selectedItem.order || 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`p-8 rounded-xl shadow-lg text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-black uppercase mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {heroItems.length === 0 ? t('heroEditor.noSlides') : t('heroEditor.selectSlide')}
                </h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                  {heroItems.length === 0 ? t('heroEditor.createFirstSlide') : t('heroEditor.chooseOrCreate')}
                </p>
                {heroItems.length > 0 && (
                  <button
                    onClick={startCreating}
                    className="mt-6 bg-brandgreen hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                  >
                    {t('heroEditor.createNewSlide')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <button
                onClick={startCreating}
                className="w-full bg-brandgreen hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold mb-6 transition-colors"
                disabled={isLoading}
              >
                {t('heroEditor.addNewSlide')}
              </button>

              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {heroItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? 'bg-brandblue/10 border-2 border-brandblue'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => selectItem(item)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <span className={theme === 'dark' ? 'text-gray-200 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                          {item.order + 1}
                        </span>
                      </div>
                      <div className={`truncate font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="uppercase font-black">
                          {item.title_en || (item.isHomeScreen ? t('heroEditor.homeScreen') : t('heroEditor.untitledSlide'))}
                        </span>
                      </div>
                    </div>
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>
                      {item.type} • {item.date || t('heroEditor.noDate')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* end right sidebar */}
        </div>
      </div>
    </div>
  );
};

export default HeroPageEditor;
