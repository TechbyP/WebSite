import { useState, useEffect } from 'react';
import { NewsItem } from '../../components/HeroNews';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeroForm from './HeroForm';
import { useTranslation } from 'react-i18next';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

const HeroPageEditor = () => {
    const { t } = useTranslation();
    const [heroItems, setHeroItems] = useState<NewsItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultItem: Partial<NewsItem> = {
        type: '',
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
        isHomeScreen: false
    };

    const [formData, setFormData] = useState<Partial<NewsItem>>(defaultItem);


   // Helper function to format titles
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

                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as NewsItem);
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

            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64Image);

            const res = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Image upload failed');
            }

            return data.data.url;
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
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
                order: item.order || heroItems.length,
                title_en: item.title_en || '',
                title_de: item.title_de || '',
                excerpt_en: item.excerpt_en || '',
                excerpt_de: item.excerpt_de || '',
                cta_en: item.cta_en || '',
                cta_de: item.cta_de || '',
                link_en: item.link_en || '',
                link_de: item.link_de || '',
                isHomeScreen: item.type === 'announcement' && !item.title_en
            } as NewsItem;

            const itemRef = doc(db, 'heroItems', itemToSave.id);
            await setDoc(itemRef, itemToSave);

            if (isCreating) {
                setHeroItems(prev => [...prev, itemToSave]);
                toast.success(t('heroEditor.createSuccess'));
            } else {
                setHeroItems(prev => prev.map(i => i.id === itemToSave.id ? itemToSave : i));
                toast.success(t('heroEditor.updateSuccess'));
            }

            setIsCreating(false);
            setIsEditing(false);
            setSelectedItem(itemToSave);
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error(error instanceof Error ? error.message : t('heroEditor.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = async (id: string) => {
        toast.info(
            <div>
                <h3>{t('heroEditor.deleteConfirm')}</h3>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={async () => {
                            toast.dismiss();
                            try {
                                setIsLoading(true);
                                await deleteDoc(doc(db, 'heroItems', id));
                                setHeroItems(prev => prev.filter(i => i.id !== id));
                                if (selectedItem?.id === id) {
                                    setSelectedItem(null);
                                }
                                toast.success(t('heroEditor.deleteSuccess'));
                            } catch (error) {
                                console.error('Error deleting item:', error);
                                toast.error(error instanceof Error ? error.message : t('heroEditor.deleteError'));
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                        {t('heroEditor.delete')}
                    </button>
                    <button
                        onClick={() => toast.dismiss()}
                        className="bg-gray-500 text-white px-4 py-1 rounded"
                    >
                        {t('heroEditor.cancel')}
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
        );
    };




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
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <h2 className="text-3xl font-black uppercase text-gray-900 mb-6">
                                    {isCreating ? t('heroEditor.createSlide') : t('heroEditor.editSlide')}
                                </h2>
                                <HeroForm
                                    item={formData}
                                    onSave={saveItem}
                                    onCancel={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        if (formData.id) {
                                            const item = heroItems.find(i => i.id === formData.id);
                                            if (item) setSelectedItem(item);
                                        }
                                    }}
                                    isLoading={isLoading}
                                    onImageUpload={uploadImage}
                                />
                            </div>
                        ) : selectedItem ? (
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                     <h2 className="text-3xl font-black uppercase text-gray-900">
                                        {selectedItem.isHomeScreen ? (
                                            selectedItem.title_en || t('heroEditor.homeScreen')
                                        ) : (
                                            formatTitle(selectedItem.title_en) || t('heroEditor.untitledSlide')
                                        )}
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
                                    <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-brandblue bg-blue-100 rounded-full">
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
                                 <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Title (English)</h3>
                                    <p className="text-gray-700 text-lg">
                                        {selectedItem.isHomeScreen ? (
                                            selectedItem.title_en
                                        ) : (
                                            formatTitle(selectedItem.title_en)
                                        )}
                                    </p>

                                    <h3 className="text-xl font-black uppercase text-gray-900 mt-4 mb-3">Title (Deutsch)</h3>
                                    <p className="text-gray-700 text-lg">
                                        {selectedItem.isHomeScreen ? (
                                            selectedItem.title_de
                                        ) : (
                                            formatTitle(selectedItem.title_de)
                                        )}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Excerpt (English)</h3>
                                    <p className="text-gray-700 text-lg">{selectedItem.excerpt_en}</p>

                                    <h3 className="text-xl font-black uppercase text-gray-900 mt-4 mb-3">Excerpt (Deutsch)</h3>
                                    <p className="text-gray-700 text-lg">{selectedItem.excerpt_de}</p>
                                </div>

                                {selectedItem.date && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Date</h3>
                                        <p className="text-gray-700 text-lg">{selectedItem.date}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Link (English)</h3>
                                        <a
                                            href={selectedItem.link_en}
                                            className="text-brandblue hover:underline text-lg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {selectedItem.link_en}
                                        </a>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Link (Deutsch)</h3>
                                        <a
                                            href={selectedItem.link_de}
                                            className="text-brandblue hover:underline text-lg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {selectedItem.link_de}
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Call to Action (English)</h3>
                                        <p className="text-gray-700 text-lg">{selectedItem.cta_en}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Call to Action (Deutsch)</h3>
                                        <p className="text-gray-700 text-lg">{selectedItem.cta_de}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-black uppercase text-gray-900 mb-3">Display Order</h3>
                                    <p className="text-gray-700 text-lg">{selectedItem.order || 0}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                                <h2 className="text-2xl font-black uppercase text-gray-900 mb-4">
                                    {heroItems.length === 0 ? t('heroEditor.noSlides') : t('heroEditor.selectSlide')}
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    {heroItems.length === 0
                                        ? t('heroEditor.createFirstSlide')
                                        : t('heroEditor.chooseOrCreate')}
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

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
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
                                        className={`p-4 rounded-lg cursor-pointer transition-all ${selectedItem?.id === item.id
                                            ? 'bg-brandblue/10 border-2 border-brandblue'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}
                                        onClick={() => selectItem(item)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-700">{item.order + 1}</span>
                                            </div>
                                            <div className="truncate font-medium text-gray-900">
                                                <span className="uppercase font-black">
                                                    {item.title_en || (item.isHomeScreen ? 'Home Screen' : 'Untitled Slide')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {item.type} • {item.date || 'No date'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroPageEditor;