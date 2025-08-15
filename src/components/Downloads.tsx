import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileText, Image, Video, File, Search,
    ArrowDown, ArrowUp, BookOpen, FileSpreadsheet, FileArchive
} from 'lucide-react';
import { useHeader } from './Header';
import { useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import SiteImage from '../assets/pictures/techbyp.png';
import { useTranslation } from 'react-i18next';

// Category definitions - will be translated via i18n
const CATEGORIES = {
    manuals: {
        icon: <BookOpen className="h-5 w-5" />,
        color: 'bg-blue-100 text-blue-800'
    },
    brochures: {
        icon: <FileText className="h-5 w-5" />,
        color: 'bg-green-100 text-green-800'
    },
    techspecs: {
        icon: <FileSpreadsheet className="h-5 w-5" />,
        color: 'bg-purple-100 text-purple-800'
    },
    other: {
        icon: <FileArchive className="h-5 w-5" />,
        color: 'bg-gray-100 text-gray-800'
    }
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

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewType, setPreviewType] = useState(null);

    useEffect(() => {
        fetch('/file-metadata.json')
            .then(res => {
                if (!res.ok) throw new Error(t('error.fetchFailed'));
                return res.json();
            })
            .then(data => {
                const mappedData = data.map(file => ({
                    ...file,
                    category: mapBackendCategory(file.category),
                    previewUrl: file.previewPath || file.previewUrl
                }));
                setFiles(mappedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [t]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        if (category && Object.keys(CATEGORIES).includes(category)) {
            setSelectedCategory(category);
        }
    }, [location.search]);

    const sortedFiles = useMemo(() => {
        let filtered = [...files];
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(f => f.category?.toLowerCase() === selectedCategory);
        }
        if (searchTerm) {
            filtered = filtered.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [files, searchTerm, sortConfig, selectedCategory]);

    const requestSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getFileIcon = (type) => FILE_ICONS[type.toLowerCase()] || FILE_ICONS.default;

    const formatDate = (str) => new Date(str).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const mapBackendCategory = (cat) => {
        if (!cat) return 'other';

        const lowerCat = cat.toLowerCase();

        switch (true) {
            case lowerCat.includes('manual'): return 'manuals';
            case lowerCat.includes('brochure'):
            case lowerCat.includes('flyer'):
            case lowerCat.includes('catalog'):
                return 'brochures';
            case lowerCat.includes('spec'):
            case lowerCat.includes('specification'):
                return 'techspecs';
            default: return 'other';
        }
    };

    const handlePreviewClick = (file) => {
        if (!file.previewUrl) return;

        const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
        const videoTypes = ['mp4', 'mov', 'avi'];

        if (file.type === 'pdf') {
            setPreviewType('pdf');
        } else if (videoTypes.includes(file.type)) {
            setPreviewType('video');
        } else if (imageTypes.includes(file.type)) {
            setPreviewType('image');
        } else {
            return;
        }

        setSelectedFile(file);
    };

    if (loading) return <div className="text-center py-12">{t('loading')}</div>;
    if (error) return <div className="text-center py-12 text-red-500">{t('error.title')}: {error}</div>;

    return (
        <section className="py-12 bg-gray-50 min-h-screen">
            <Helmet>
                <title>{t('meta.title')}</title>
                <meta name="description" content={t('meta.description')} />
                <meta property="og:title" content={t('meta.title')} />
                <meta property="og:description" content={t('meta.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.techbyp.com/downloads" />
                <meta property="og:image" content={SiteImage} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-black leading-tight text-black uppercase">
                        {t('title')}
                    </h2>
                    <p className="text-xl md:text-base text-brandblue font-black">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-md text-sm font-black transition-colors ${selectedCategory === 'all'
                            ? 'bg-brandgreen text-white'
                            : 'border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-brandgreen'
                            }`}
                    >
                        {t('downloads.categories.all')}
                    </button>
                    {Object.keys(CATEGORIES).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-4 py-2 rounded-md text-sm font-black transition-colors flex items-center ${selectedCategory === key
                                ? 'bg-brandgreen text-white'
                                : 'border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-brandgreen'
                                }`}
                        >
                            <span className="mr-2">{CATEGORIES[key].icon}</span>
                            {t(`downloads.categories.${key}`)}
                        </button>
                    ))}
                </div>

                {/* Search + Sort Controls */}
                <div
                    className="bg-white/95 rounded-lg shadow-sm border border-gray-200 mb-6"
                    style={{ top: isVisible ? `${height}px` : '0px' }}
                >
                    <div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brandgreen sm:text-sm"
                                placeholder={t('search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex flex-wrap items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">{t('downloads.sort.label')}:</span>
                            {['name', 'date', 'size'].map((key) => (
                                <button
                                    key={key}
                                    onClick={() => requestSort(key)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${sortConfig.key === key
                                        ? 'bg-brandgreen text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {t(`downloads.sort.${key}`)}
                                    {sortConfig.key === key &&
                                        (sortConfig.direction === 'asc'
                                            ? <ArrowUp className="ml-1 h-4 w-4" />
                                            : <ArrowDown className="ml-1 h-4 w-4" />)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Files grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedFiles.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden"
                        >
                            <div
                                className={`p-5 cursor-pointer ${file.previewUrl ? 'hover:bg-gray-50' : ''}`}
                                onClick={() => file.previewUrl && handlePreviewClick(file)}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{file.name}</h3>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <span>{file.size}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(file.date)}</span>
                                        </div>
                                        <div className="mt-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORIES[file.category].color}`}>
                                                {CATEGORIES[file.category].icon}
                                                <span className="ml-1">{t(`categories.${file.category}`)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = file.url || `/files/${file.name}`;
                                            link.download = file.name;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-brandblue hover:bg-brandgreen"
                                    >
                                        <Download className="-ml-0.5 mr-2 h-4 w-4" />
                                        {t('download')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* No files found */}
                {sortedFiles.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                            <File className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">{t('empty.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? t('empty.search') : t('empty.category')}
                        </p>
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
                            className="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setSelectedFile(null)}
                            key="backdrop"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            key="modal"
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {selectedFile.name}
                                            </h3>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORIES[selectedFile.category].color}`}>
                                                    {CATEGORIES[selectedFile.category].icon}
                                                    <span className="ml-1">{t(`categories.${selectedFile.category}`)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <a
                                                href={selectedFile.downloadUrl || selectedFile.previewUrl}
                                                download={selectedFile.name}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen"
                                            >
                                                {t('download')}
                                            </a>
                                            <button
                                                type="button"
                                                className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                                onClick={() => setSelectedFile(null)}
                                            >
                                                <span className="sr-only">{t('close')}</span>
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        {previewType === 'pdf' && (
                                            <div className="w-full h-[70vh]">
                                                <iframe
                                                    sizes="(max-width: 768px) 50vw, 25vw"
srcSet={selectedFile.previewUrl}
                                                    className="w-full h-full border border-gray-200 rounded-lg"
                                                    title={selectedFile.name}
                                                />
                                            </div>
                                        )}
                                        {previewType === 'image' && (
                                            <div className="flex justify-center">
                                                <img
                                                    sizes="(max-width: 768px) 50vw, 25vw"
srcSet={selectedFile.previewUrl}
                                                    alt={selectedFile.name}
                                                    className="max-h-[70vh] max-w-full object-contain border border-gray-200 rounded-lg"
                                                />
                                            </div>
                                        )}
                                        {previewType === 'video' && (
                                            <div className="flex justify-center">
                                                <video
                                                    controls
                                                    className="max-h-[70vh] max-w-full border border-gray-200 rounded-lg"
                                                >
                                                    <source sizes="(max-width: 768px) 50vw, 25vw"
srcSet={selectedFile.previewUrl} type={`video/${selectedFile.type}`} />
                                                    {t('videoNotSupported')}
                                                </video>
                                            </div>
                                        )}
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