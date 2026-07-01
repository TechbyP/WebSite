import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileText, Image, Video, File, Search,
    ArrowDown, ArrowUp, BookOpen, FileSpreadsheet, FileArchive
} from 'lucide-react';
import { useHeader } from './Header';
import { buildCanonicalUrl } from '../utils/seo';
import { useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import SiteImage from '../assets/pictures/techbyp.png';
import { useTranslation } from 'react-i18next';
import { trackAiConversion } from '../utils/publicApi';

// Category definitions
const CATEGORIES = {
    manuals: { icon: <BookOpen className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    brochures: { icon: <FileText className="h-5 w-5" />, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    techspecs: { icon: <FileSpreadsheet className="h-5 w-5" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    other: { icon: <FileArchive className="h-5 w-5" />, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
};

type CategoryKey = keyof typeof CATEGORIES;
type SelectedCategory = CategoryKey | 'all';
type SortKey = 'name' | 'date' | 'size';
type PreviewType = 'pdf' | 'video' | 'image' | null;

type BackendFileMetadata = {
    id: string | number;
    name: string;
    type: string;
    category?: string;
    size: string;
    date: string;
    url?: string;
    previewUrl?: string;
    previewPath?: string;
    downloadUrl?: string;
};

type DownloadFile = {
    id: string | number;
    name: string;
    type: string;
    category: CategoryKey;
    size: string;
    date: string;
    url?: string;
    previewUrl?: string;
    downloadUrl?: string;
};

type SortConfig = {
    key: SortKey;
    direction: 'asc' | 'desc';
};

const normalizeFileType = (type: string) => type.trim().toLowerCase().replace(/^\./, '');

const parseSizeToBytes = (size: string) => {
    const match = size.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
    if (!match) return 0;

    const value = Number(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
    };

    return value * (multipliers[unit] ?? 1);
};

// File type icons
const FILE_ICONS = {
    pdf: <FileText className="h-5 w-5" />,
    jpg: <Image className="h-5 w-5" />,
    jpeg: <Image className="h-5 w-5" />,
    png: <Image className="h-5 w-5" />,
    gif: <Image className="h-5 w-5" />,
    mp4: <Video className="h-5 w-5" />,
    mov: <Video className="h-5 w-5" />,
    avi: <Video className="h-5 w-5" />,
    zip: <FileArchive className="h-5 w-5" />,
    default: <File className="h-5 w-5" />
};

const FileDownloadPage = () => {
    const { t } = useTranslation();
    const { isVisible, height } = useHeader();
    const location = useLocation();

    const [files, setFiles] = useState<DownloadFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
    const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('all');
    const [selectedFile, setSelectedFile] = useState<DownloadFile | null>(null);
    const [previewType, setPreviewType] = useState<PreviewType>(null);

    useEffect(() => {
        fetch('/file-metadata.json')
            .then(res => {
                if (!res.ok) throw new Error(t('downloads.error.fetchFailed'));
                return res.json();
            })
            .then((data: BackendFileMetadata[]) => {
                const mappedData: DownloadFile[] = data.map((file) => ({
                    ...file,
                    type: normalizeFileType(file.type),
                    category: mapBackendCategory(file.category),
                    previewUrl: file.previewPath ?? file.previewUrl
                }));
                setFiles(mappedData);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [t]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        if (category && category in CATEGORIES) {
            setSelectedCategory(category as CategoryKey);
        }
    }, [location.search]);

    const sortedFiles = useMemo(() => {
        let filtered = [...files];
        if (selectedCategory !== 'all') filtered = filtered.filter((f) => f.category === selectedCategory);
        if (searchTerm) filtered = filtered.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
        filtered.sort((a, b) => {
            let compareValue = 0;

            if (sortConfig.key === 'name') {
                compareValue = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            } else if (sortConfig.key === 'date') {
                compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                compareValue = parseSizeToBytes(a.size) - parseSizeToBytes(b.size);
            }

            if (compareValue < 0) return sortConfig.direction === 'asc' ? -1 : 1;
            if (compareValue > 0) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [files, searchTerm, sortConfig, selectedCategory]);

    const requestSort = (key: SortKey) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const getFileIcon = (type: string) => FILE_ICONS[normalizeFileType(type) as keyof typeof FILE_ICONS] || FILE_ICONS.default;
    const formatDate = (str: string) => new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    const mapBackendCategory = (cat?: string): CategoryKey => {
        if (!cat) return 'other';
        const lowerCat = cat.toLowerCase();
        switch (true) {
            case lowerCat.includes('manual'): return 'manuals';
            case lowerCat.includes('brochure') || lowerCat.includes('flyer') || lowerCat.includes('catalog'): return 'brochures';
            case lowerCat.includes('spec') || lowerCat.includes('specification'): return 'techspecs';
            default: return 'other';
        }
    };

    const handlePreviewClick = (file: DownloadFile) => {
        if (!file.previewUrl) return;
        const imageTypes = ['jpg','jpeg','png','gif'];
        const videoTypes = ['mp4','mov','avi'];
        const normalizedType = normalizeFileType(file.type);
        if (normalizedType === 'pdf') setPreviewType('pdf');
        else if (videoTypes.includes(normalizedType)) setPreviewType('video');
        else if (imageTypes.includes(normalizedType)) setPreviewType('image');
        else return;
        setSelectedFile(file);
    };

    const closePreview = () => {
        setSelectedFile(null);
        setPreviewType(null);
    };

    if (loading) return <div className="text-center py-12 dark:text-gray-200">{t('downloads.loading')}</div>;
    if (error) return <div className="text-center py-12 text-red-500 dark:text-red-400">{t('downloads.error.title')}: {error}</div>;

    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Helmet>
                <title>{t('downloads.meta.title')}</title>
                <meta name="description" content={t('downloads.meta.description')} />
                <meta property="og:title" content={t('downloads.meta.title')} />
                <meta property="og:description" content={t('downloads.meta.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.techbyp.com/downloads" />
                <meta property="og:image" content={SiteImage} />
                <link rel="canonical" href={buildCanonicalUrl('/downloads')} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-black leading-tight text-black dark:text-gray-100 uppercase">
                        {t('downloads.title')}
                    </h2>
                    <p className="text-xl md:text-base text-brandblue dark:text-brandgreen font-black">
                        {t('downloads.subtitle')}
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-md text-sm font-black transition-colors ${selectedCategory === 'all'
                            ? 'bg-brandgreen text-white'
                            : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-brandgreen'
                        }`}
                    >
                        {t('downloads.categories.all')}
                    </button>
                    {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-4 py-2 rounded-md text-sm font-black transition-colors flex items-center ${selectedCategory === key
                                ? 'bg-brandgreen text-white'
                                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-brandgreen'
                            }`}
                        >
                            <span className="mr-2">{CATEGORIES[key].icon}</span>
                            {t(`downloads.categories.${key}`)}
                        </button>
                    ))}
                </div>

                {/* Search + Sort */}
                <div className="bg-white/95 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6" style={{ top: isVisible ? `${height}px` : '0px' }}>
                    <div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brandgreen sm:text-sm"
                                placeholder={t('downloads.search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Sort buttons */}
                        <div className="flex flex-wrap items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('downloads.sort.label')}:</span>
                            {(['name','date','size'] as SortKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => requestSort(key)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${sortConfig.key===key
                                        ? 'bg-brandgreen text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {t(`downloads.sort.${key}`)}
                                    {sortConfig.key === key && (sortConfig.direction==='asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Files grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedFiles.map(file => (
                        <motion.div key={file.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg overflow-hidden"
                        >
                            <div className={`p-5 cursor-pointer ${file.previewUrl ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`} onClick={() => file.previewUrl && handlePreviewClick(file)}>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{file.name}</h3>
                                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <span>{file.size}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(file.date)}</span>
                                        </div>
                                        <div className="mt-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORIES[file.category].color}`}>
                                                {CATEGORIES[file.category].icon}
                                                <span className="ml-1">{t(`downloads.categories.${file.category}`)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-3">
                                <div className="flex justify-end">
                                    <button onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = file.downloadUrl || file.url || `/files/${file.name}`;
                                        link.download = file.name;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        trackAiConversion('download_file', file.name);
                                    }}
                                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-brandblue hover:bg-brandgreen"
                                    >
                                        <Download className="-ml-0.5 mr-2 h-4 w-4" />
                                        {t('downloads.download')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* No files found */}
                {sortedFiles.length===0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
                            <File className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{t('downloads.empty.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{searchTerm ? t('downloads.empty.search') : t('downloads.empty.category')}</p>
                    </div>
                )}
            </div>

            {/* File Preview Modal */}
            <AnimatePresence>
                {selectedFile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
                            onClick={closePreview}
                            key="backdrop"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
                            key="modal"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-full sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col h-full sm:h-auto p-4 sm:p-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</h3>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORIES[selectedFile.category].color}`}>
                                                    {CATEGORIES[selectedFile.category].icon}
                                                    <span className="ml-1">{t(`downloads.categories.${selectedFile.category}`)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <a href={selectedFile.downloadUrl || selectedFile.url || selectedFile.previewUrl || `/files/${selectedFile.name}`} download={selectedFile.name}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen"
                                            >
                                                {t('downloads.download')}
                                            </a>
                                            <button type="button" className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 focus:outline-none" onClick={closePreview}>
                                                <span className="sr-only">{t('downloads.close')}</span>
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="flex-1 mt-4 flex items-center justify-center w-full">
                                        {previewType==='pdf' && <iframe src={selectedFile.previewUrl} className="w-full h-full sm:h-[70vh] border border-gray-200 dark:border-gray-600 rounded-lg" title={selectedFile.name} />}
                                        {previewType==='image' && <img src={selectedFile.previewUrl} alt={selectedFile.name} className="w-full h-full sm:max-h-[70vh] object-contain border border-gray-200 dark:border-gray-600 rounded-lg" />}
                                        {previewType==='video' && <video controls className="w-full h-full sm:max-h-[70vh] border border-gray-200 dark:border-gray-600 rounded-lg">
                                            <source src={selectedFile.previewUrl} type={`video/${selectedFile.type}`} />
                                            {t('downloads.videoNotSupported')}
                                        </video>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FileDownloadPage;
