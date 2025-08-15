import { useState, useEffect } from 'react';
import { NewsItem } from '../../components/HeroNews';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface Article {
    id: string;
    title: string;
    title_de?: string;
    language?: string;
}

interface HeroFormProps {
    item: Partial<NewsItem>;
    onSave: (item: Partial<NewsItem>) => void;
    onCancel: () => void;
    isLoading: boolean;
    onImageUpload: (file: File) => Promise<string>;
}

const HeroForm = ({ item, onSave, onCancel, isLoading, onImageUpload }: HeroFormProps) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<NewsItem>>(item);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'de'>('en');

    useEffect(() => {
        setFormData(item);
        setImagePreview(item.image || null);
        fetchArticles();
    }, [item]);

    const fetchArticles = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'articles'));
            const articleList = querySnapshot.docs.map(doc => ({
                id: doc.data().id || doc.id,
                title: doc.data().title || "Untitled",
                title_de: doc.data().title_de || doc.data().title || "Untitled",
                language: doc.data().language || 'en'
            }));
            setArticles(articleList);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle language-specific fields
        if (name.startsWith('title_') || name.startsWith('excerpt_') ||
            name.startsWith('cta_') || name.startsWith('link_')) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLanguageChange = (lang: 'en' | 'de') => {
        setSelectedLanguage(lang);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            try {
                setIsUploading(true);
                const imageUrl = await onImageUpload(file);
                setFormData(prev => ({
                    ...prev,
                    image: imageUrl
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
                setImagePreview(null);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isHomeScreen = formData.type === 'announcement' && !formData.title;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
            <div>
                {/* <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                    {t('heroEditor.language')}
                </label> */}
                {/* <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => handleLanguageChange('en')}
                        className={`px-4 py-2 rounded-lg ${selectedLanguage === 'en' ? 'bg-brandblue text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        English
                    </button>
                    <button
                        type="button"
                        onClick={() => handleLanguageChange('de')}
                        className={`px-4 py-2 rounded-lg ${selectedLanguage === 'de' ? 'bg-brandblue text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Deutsch
                    </button>
                </div> */}
            </div>

            <div>
                <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                    {t('heroEditor.slideType')}
                </label>
                <select
                    name="type"
                    value={formData.type || ''}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    required
                >
                    <option value="event">{t('heroEditor.event')}</option>
                    <option value="product">{t('heroEditor.product')}</option>
                    <option value="article">{t('heroEditor.article')}</option>
                    <option value="announcement">{t('heroEditor.homeScreen')}</option>
                </select>
            </div>

            {!isHomeScreen && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.title')} (English)
                            </label>
                            <input
                                type="text"
                                name="title_en"
                                value={formData.title_en || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                                required={!isHomeScreen}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.title')} (Deutsch)
                            </label>
                            <input
                                type="text"
                                name="title_de"
                                value={formData.title_de || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                                required={!isHomeScreen}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.excerpt')} (English)
                            </label>
                            <textarea
                                name="excerpt_en"
                                value={formData.excerpt_en || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                                rows={3}
                                required={!isHomeScreen}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.excerpt')} (Deutsch)
                            </label>
                            <textarea
                                name="excerpt_de"
                                value={formData.excerpt_de || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                                rows={3}
                                required={!isHomeScreen}
                            />
                        </div>
                    </div>
                    

                    <div>
                        <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                            {t('heroEditor.date')}
                        </label>
                        <input
                            type="text"
                            name="date"
                            value={formData.date || ''}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                            placeholder={t('heroEditor.datePlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                            {t('heroEditor.selectBlogPost')}
                        </label>
                        <select
                            value={selectedArticle?.id || ''}
                            onChange={(e) => {
                                const articleId = e.target.value;
                                const article = articles.find(a => a.id === articleId);
                                if (article) {
                                    setSelectedArticle(article);
                                    setFormData(prev => ({
                                        ...prev,
                                        link: `/blog/${article.id}`,
                                        cta: prev.cta?.trim() ? prev.cta : t('heroEditor.readMore')
                                    }));
                                }
                            }}
                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                        >
                            <option value="">-- {t('heroEditor.selectBlogPost')} --</option>
                            {articles.map(article => (
                                <option key={article.id} value={article.id}>
                                    {selectedLanguage === 'de' ? article.title_de : article.title}
                                </option>
                            ))}
                        </select>
                    </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.callToAction')} (English)
                            </label>
                            <input
                                type="text"
                                name="cta_en"
                                value={formData.cta_en || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.callToAction')} (Deutsch)
                            </label>
                            <input
                                type="text"
                                name="cta_de"
                                value={formData.cta_de || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.link')} (English)
                            </label>
                            <input
                                type="text"
                                name="link_en"
                                value={formData.link_en || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                                {t('heroEditor.link')} (Deutsch)
                            </label>
                            <input
                                type="text"
                                name="link_de"
                                value={formData.link_de || ''}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                            />
                        </div>
                    </div>
                   
                </>
            )}

            <div>
                <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                    {t('heroEditor.backgroundImage')} {isHomeScreen ? `(${t('heroEditor.required')})` : ''}
                </label>
                <label className={`block w-full bg-brandblue hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-center cursor-pointer transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                    {isUploading ? t('heroEditor.uploading') : t('heroEditor.selectImage')}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required={isHomeScreen}
                        disabled={isLoading}
                    />
                </label>
                {isUploading && <p className="text-sm text-gray-500 mt-2">{t('heroEditor.uploadingImage')}</p>}
                {imagePreview && (
                    <div className="mt-4">
                        <img
                            sizes="(max-width: 768px) 50vw, 25vw"
srcSet={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl shadow-md"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-lg font-black uppercase text-gray-900 mb-2">
                    {t('heroEditor.displayOrder')}
                </label>
                <input
                    type="number"
                    name="order"
                    value={formData.order || 0}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent"
                    min="0"
                />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                    disabled={isLoading}
                >
                    {t('heroEditor.cancel')}
                </button>
                <button
                    type="submit"
                    className="bg-brandgreen hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                    disabled={isLoading || (isHomeScreen && !formData.image)}
                >
                    {isLoading ? t('heroEditor.saving') : t('heroEditor.saveSlide')}
                </button>
            </div>
        </form>
    );
};

export default HeroForm;