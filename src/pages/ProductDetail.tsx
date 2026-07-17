import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, FileText, Users, Award, Wrench } from 'lucide-react';
import OrderNow from '../components/OrderNow';
import {
  getProductMediaFallbacks,
  getCategoryLabel,
  handleImageError,
  defaultGalleryImage,
  defaultHeroImage
} from '../utils/DefaultPics';
import VideoSection from '../utils/VideoSection';
import Comments from '../utils/Comments';
import { showProductToast } from '../components/configurator/utils/ShowToastContent';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import parseHtmlText from '../utils/parseText'
import i18n from '../i18n';
import { useProducts } from '../data/context/ProductsContext';
import { loadProductGallery } from '../data/productGalleryLoaders';
import { buildCanonicalUrl, normalizeResourceId, toAbsoluteUrl } from '../utils/seo';
import SparePartsSection from '../components/spareParts/SparePartsSection';
import {
  findSparePartsCatalogForProduct,
  getSparePartsModelForProduct,
  SPARE_PARTS_CATALOGS,
  type SparePartsCatalog,
} from '../data/sparePartsCatalog';
import {
  loadManagedSparePartsCatalogs,
  mergeManagedSparePartsCatalogWithBase,
} from '../data/sparePartsCms';

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, getProductsByCategory } = useProducts();
  const normalizedId = normalizeResourceId(id);
  const productId = Number.parseInt(normalizedId || '1', 10);
  const product = Number.isNaN(productId) ? undefined : getProductById(productId);
  const keyTranslationsDe = {
    "Sampling Depth": "Probentiefe",
    "Sampling Depth Example": "0–60 cm",
    "Sampling Type": "Probentyp",
    "Sampling Type Example": "Schlaggesteuert, vollautomatisch",
    "Hammer Unit": "Hammerantrieb",
    "Hammer Unit Example": "Hydraulisch, hochfrequent",
    "Horizons": "Horizonte",
    "Horizons Example": "1–2 Schichten",
    "Magazines": "Magazine",
    "Magazines Example": "3",
    "Sampling Cycle Time": "Probennahmezykluszeit",
    "Sampling Cycle Time Example": "18 Sek./Kern",
    "Mounting Options": "Montagemöglichkeiten",
    "Mounting Options Example": "Pickup, Anhänger oder jedes halbwegs straßentaugliche Fahrzeug",
    "Sample Sorting": "Proben-Sortierung",
    "Sample Sorting Example": "Automatisch, horizonspezifische Trennung",
    "Special Features": "Besondere Merkmale",
    "Special Features Example": "Hinderniserkennung, wasserdichte Behälter, Digitaltastatur",
    "Power Source": "Energiequelle",
    "Power Source Example": "Hydrauliksystem (135 bar, 20 l/min, 12VDC)",
    "Weight": "Gewicht",
    "Weight Example": "200 kg",
    "Wheels": "Räder"
  };

  const keyTranslationsRo = {
    "Sampling Depth": "Adâncime de prelevare",
    "Sample Type": "Tip probă",
    "Sampling Type": "Tip prelevare",
    "Hammer Unit": "Unitate ciocan",
    "Horizons": "Orizonturi",
    "Magazines": "Magazine",
    "Sampling Cycle": "Ciclu de prelevare",
    "Sampling Cycle Time": "Timp ciclu de prelevare",
    "Mounting": "Montare",
    "Mounting Options": "Opțiuni de montare",
    "Sample Sorting": "Sortare probe",
    "Special Features": "Caracteristici speciale",
    "Power Source": "Sursă de alimentare",
    "Power Supply": "Alimentare",
    "Weight": "Greutate",
    "Obstacle Detection": "Detecție obstacole",
    "Control Panel": "Panou de control",
    "Penetration Control": "Control penetrare",
    "Control": "Control",
    "Operating Voltage": "Tensiune de operare",
    "Wheels": "Roți"
  };

  const keyTranslationsPt = {
    "Sampling Depth": "Profundidade de amostragem",
    "Sample Type": "Tipo de amostra",
    "Sampling Type": "Tipo de amostragem",
    "Hammer Unit": "Unidade de martelo",
    "Horizons": "Horizontes",
    "Magazines": "Carregadores",
    "Sampling Cycle": "Ciclo de amostragem",
    "Sampling Cycle Time": "Tempo do ciclo de amostragem",
    "Mounting": "Montagem",
    "Mounting Options": "Opções de montagem",
    "Sample Sorting": "Classificação de amostras",
    "Special Features": "Características especiais",
    "Power Source": "Fonte de energia",
    "Power Supply": "Alimentação",
    "Weight": "Peso",
    "Obstacle Detection": "Detecção de obstáculos",
    "Control Panel": "Painel de controlo",
    "Penetration Control": "Controlo de penetração",
    "Control": "Controlo",
    "Operating Voltage": "Tensão de operação",
    "Wheels": "Rodas",
    "Transmission": "Transmissão",
    "ViewingAngle": "Ângulo de visão"
  };

  const keyTranslationsRu = {
    "Sampling Depth": "Глубина отбора проб",
    "Sample Type": "Тип пробы",
    "Sampling Type": "Тип отбора",
    "Hammer Unit": "Ударный узел",
    "Horizons": "Горизонты",
    "Magazines": "Магазины",
    "Sampling Cycle": "Цикл отбора проб",
    "Sampling Cycle Time": "Время цикла отбора",
    "Mounting": "Монтаж",
    "Mounting Options": "Варианты монтажа",
    "Sample Sorting": "Сортировка проб",
    "Special Features": "Особые функции",
    "Power Source": "Источник питания",
    "Power Supply": "Питание",
    "Weight": "Вес",
    "Obstacle Detection": "Обнаружение препятствий",
    "Control Panel": "Панель управления",
    "Penetration Control": "Контроль проникновения",
    "Control": "Управление",
    "Operating Voltage": "Рабочее напряжение",
    "Wheels": "Колёса",
    "Transmission": "Передача",
    "ViewingAngle": "Угол обзора"
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showImageToast, setShowImageToast] = useState(false);
  const [isSparePartsModalOpen, setIsSparePartsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [managedSparePartsCatalogs, setManagedSparePartsCatalogs] = useState<SparePartsCatalog[] | null>(null);
  const currentLanguage = i18n.language; // Get current language

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSparePartsModalOpen(false);
  }, [id]);

  useEffect(() => {
    const fallbackGallery = product?.image ? [product.image] : [defaultHeroImage];

    setCurrentImageIndex(0);
    setGallery(fallbackGallery);

    if (!product) {
      return;
    }

    let cancelled = false;

    void loadProductGallery(product.id)
      .then((loadedGallery) => {
        if (cancelled || !loadedGallery?.length) {
          return;
        }

        setGallery(loadedGallery);
      })
      .catch(() => {
        if (!cancelled) {
          setGallery(fallbackGallery);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  useEffect(() => {
    let cancelled = false;

    void loadManagedSparePartsCatalogs()
      .then((catalogs) => {
        if (cancelled) {
          return;
        }

        setManagedSparePartsCatalogs(catalogs);
      })
      .catch(() => {
        if (!cancelled) {
          setManagedSparePartsCatalogs([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!product) {
    return <div className="dark:text-white">{t('product.notFound')}</div>;
  }

  const relatedProducts = getProductsByCategory(product.category || '').filter((entry) => entry.id !== product.id);
  const effectiveSparePartsCatalogs = useMemo(() => {
    if (!managedSparePartsCatalogs || managedSparePartsCatalogs.length === 0) {
      return SPARE_PARTS_CATALOGS;
    }

    const merged = new Map<string, SparePartsCatalog>();

    for (const catalog of SPARE_PARTS_CATALOGS) {
      merged.set(catalog.id, catalog);
    }

    for (const catalog of managedSparePartsCatalogs) {
      const baseCatalog = merged.get(catalog.id);
      if (baseCatalog) {
        merged.set(catalog.id, mergeManagedSparePartsCatalogWithBase(baseCatalog, catalog));
        continue;
      }

      merged.set(catalog.id, catalog);
    }

    return [...merged.values()];
  }, [managedSparePartsCatalogs]);

  const sparePartsCatalog = findSparePartsCatalogForProduct(product.id, effectiveSparePartsCatalogs);
  const hasSpareParts = Boolean(sparePartsCatalog);
  const sparePartsModel = sparePartsCatalog
    ? getSparePartsModelForProduct(sparePartsCatalog, product.id)
    : undefined;
  const isConfigurableProduct = product.id >= 1000 && product.id < 2000;


  const {
    heroImage,
    heroVideo,
    icon: IconComponent
  } = getProductMediaFallbacks(product);
  const productCategory = product.category || '';
  const productFeatures = product.features || [];
  const productApplications = product.applications || [];
  const productHowToUse = product.howToUse || [];
  const productTechnicalSpecs = product.technicalSpecs || {};
  const heroDescription =
    typeof product.herodescription === 'string' ? parseHtmlText(product.herodescription) : product.herodescription;
  const detailedDescription =
    typeof product.detailedDescription === 'string' ? parseHtmlText(product.detailedDescription) : product.detailedDescription;
  const productUrl = buildCanonicalUrl(`/product/${product.id}`);
  const primaryImage = gallery[0] || heroImage;
  const primaryImageUrl = toAbsoluteUrl(primaryImage.split(',')[0]?.trim().split(' ')[0] || '');
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: typeof product.herodescription === 'string' ? product.herodescription : (product.description || ''),
    category: getCategoryLabel(productCategory),
    image: [primaryImageUrl],
    brand: {
      '@type': 'Brand',
      name: 'TechByP',
    },
    sku: String(product.id),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: product.priceValue,
      availability: 'https://schema.org/InStock',
      url: productUrl,
    },
    additionalProperty: productFeatures.slice(0, 8).map((feature, index) => ({
      '@type': 'PropertyValue',
      name: `Feature ${index + 1}`,
      value: feature,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: buildCanonicalUrl('/?id=products'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({ top: section.offsetTop - 20, behavior: 'smooth' });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Helmet>
        <title>{t('product.meta.title', { brand: 'TECHBYP', product: product.name, category: getCategoryLabel(productCategory) })}</title>
        <meta
          name="description"
          content={t('product.meta.description', {
            nickname: product.nickname,
            herodescription: typeof product.herodescription === 'string' ? product.herodescription : (product.description || ''),
            features: productFeatures.slice(0, 3).join(', '),
            applications: productApplications.join(', ')
          })}
        />
        <meta name="keywords" content={productFeatures.join(', ')} />
        <meta name="robots" content="index, follow" />
        <meta property="og:url" content={productUrl} />
        <link rel="canonical" href={productUrl} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            srcSet={heroImage}
            className="w-full h-full object-cover object-[70%]"
            loading="eager"
            decoding="async"
            width={1920}
            height={1080}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70"></div>
        </div>

        <div className="relative z-10 text-left text-white max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-400 bg-blue-400/10 rounded-full backdrop-blur-sm">
              <IconComponent className="h-4 w-4 mr-2" />
              <span>{getCategoryLabel(productCategory)}</span>
            </span>
          </div>
          <h2 className="text-xl md:text-1xl lg:text-2xl font-black mb-4 leading-tight uppercase">
            {product.nickname}
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 leading-tight uppercase tracking-tight">
            {product.name}
          </h1>
          <div className="text-xl md:text-xl text-white mb-8 leading-relaxed max-w-2xl">
            {heroDescription}
          </div>
          <div className="flex items-center justify-start space-x-2 mb-8">
            <span className="text-3xl font-black uppercase text-brandgreen">{product.price}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('detail');
          }}
          className="absolute bottom-28 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </button>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div id="detail" className="lg:col-span-2 lg:order-2">
            <div className="mb-12">
              <h2 className="text-5xl font-black uppercase text-gray-900 dark:text-white mb-6">{t('product.whatMakesItGreat')}</h2>
              <div className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                {detailedDescription}
              </div>

              {product.table && product.table.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('product.goodsCurrentlyGracing')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t('product.articleNo')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t('product.description')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {product.table.map((row, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {row.emNo}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {row.articleName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('product.highlights')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-brandblue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('product.itShinesHere')}</h3>
                <div className="flex flex-wrap gap-2">
                  {productApplications.map((application, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-200 dark:bg-orange-300 text-gray-700 dark:text-gray-800 text-sm font-black rounded-full"
                    >
                      {application}
                    </span>
                  ))}
                </div>
              </div>

              {productHowToUse.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('product.satisfyingBit')}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {productHowToUse.map((howToUse, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-brandblue font-semibold">{index + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300">{howToUse}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-12">
                <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-6">{t('product.upClosePersonal')}</h2>
                <div className="relative mb-6">
                  <div className="mb-4">
                    {currentImageIndex === 0 && heroVideo ? (
                      <VideoSection
                        videoId={heroVideo}
                        posterSrc={gallery[0]}
                        posterSrcSet={gallery[0]}
                        posterSizes="(max-width: 768px) 50vw, 25vw"
                        title={product.name}
                      />
                    ) : (
                      <>
                        <img
                          srcSet={gallery[currentImageIndex]}
                          alt={`${product.name} - Image ${currentImageIndex + 1}`}
                          style={{ width: '100%', height: '384px', objectFit: 'cover', borderRadius: '0.5rem' }}
                          onClick={() => setShowImageToast(true)}
                          className="cursor-pointer"
                          onError={(e) => handleImageError(e, defaultHeroImage)}
                        />
                        {showImageToast && (
                          <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                            onClick={() => setShowImageToast(false)}
                          >
                            <div
                              className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                              style={{ maxWidth: 800, maxHeight: '90vh' }}
                              onClick={e => e.stopPropagation()}
                            >
                              <img
                                srcSet={gallery[currentImageIndex]}
                                alt={`${product.name} - Full Image`}
                                onError={(e) => handleImageError(e, defaultGalleryImage)}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
                              />
                              <button
                                onClick={() => setShowImageToast(false)}
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black"
                                aria-label={t('commons.close')}
                              />
                              <button
                                onClick={() => setCurrentImageIndex((currentImageIndex - 1 + gallery.length) % gallery.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/0 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full p-2"
                                aria-label={t('commons.previous')}
                              >
                                <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                              </button>
                              <button
                                onClick={() => setCurrentImageIndex((currentImageIndex + 1) % gallery.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/0 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full p-2"
                                aria-label={t('commons.next')}
                              >
                                <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevImage}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                      aria-label={t('commons.previous')}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('commons.imageCounter', { current: currentImageIndex + 1, total: gallery.length })}
                    </span>
                    <button
                      onClick={nextImage}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                      aria-label={t('commons.next')}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {gallery.map((gallery, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''}`}
                      >
                        <img
                          srcSet={gallery}
                          alt={t('commons.thumbnail', { number: index + 1 })}
                          onError={(e) => handleImageError(e, defaultHeroImage)}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        />
                      </button>
                    ))}
                  </div>
                </>

                <div className="mt-8 mb-8">
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">{t('product.specsSmarts')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {Object.entries(productTechnicalSpecs).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <span className="font-black uppercase text-brandblue dark:text-blue-400">
                            {currentLanguage === 'de'
                              ? (keyTranslationsDe[key as keyof typeof keyTranslationsDe] || key)
                              : currentLanguage === 'ro'
                                ? (keyTranslationsRo[key as keyof typeof keyTranslationsRo] || key)
                                : currentLanguage === 'pt'
                                  ? (keyTranslationsPt[key as keyof typeof keyTranslationsPt] || key)
                                  : currentLanguage === 'ru'
                                    ? (keyTranslationsRu[key as keyof typeof keyTranslationsRu] || key)
                                : key}:
                          </span>
                          <span className="text-brandblue dark:text-blue-400">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:hidden mt-12">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('product.otherCategory', { category: product.category })}</h3>
              <div className="space-y-4">
                {relatedProducts.slice(0, 10).map((relatedProduct) => {
                  const { heroImage: relatedHeroImage } = getProductMediaFallbacks(relatedProduct);

                  return (
                    <button
                      key={relatedProduct.id}
                      onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          srcSet={relatedHeroImage}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, defaultHeroImage)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase text-gray-900 dark:text-white truncate">{relatedProduct.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{relatedProduct.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-6">{t('product.provenInField')}</h2>
              <Comments productId={String(product.id)} />
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 lg:order-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('product.otherCategory', { category: product.category })}</h3>
              <div className="space-y-4">
                {relatedProducts.slice(0, 10).map((relatedProduct) => {
                  const { heroImage: relatedHeroImage } = getProductMediaFallbacks(relatedProduct);

                  return (
                    <button
                      key={relatedProduct.id}
                      onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          srcSet={relatedHeroImage}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, defaultHeroImage)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase text-gray-900 dark:text-white truncate">{relatedProduct.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{relatedProduct.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 lg:order-3">
            <div className="sticky top-24">
              {hasSpareParts && (
                <button
                  onClick={() => setIsSparePartsModalOpen(true)}
                  className="w-full mb-4 border-2 border-brandgreen bg-white text-brandgreen hover:bg-brandgreen hover:text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm dark:bg-brandgreen dark:text-white dark:hover:bg-green-900"
                >
                  {t('spareParts.jumpButton', { defaultValue: 'Open Spare Parts' })}
                </button>
              )}

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-2xl font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">{product.price}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('product.engineeredForPros')}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setSelectedProductId(product.id.toString());
                      setShowOrderModal(true);
                    }}
                    className="w-full bg-brandgreen hover:bg-green-900 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center group"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('product.orderNow')}
                  </button>
                  {product.id >= 1000 && product.id < 2000 && (
                    <button
                      onClick={() => showProductToast(product)}
                      className="w-full bg-white dark:bg-gray-800 border border-brandgreen text-brandgreen hover:bg-brandgreen hover:text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {t('product.quickConfigure')}
                    </button>
                  )}
                </div>

                <div className="space-y-3 mt-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Award className="h-8 w-8 text-green-600" />
                    <span>{t('product.builtTough')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span>{t('product.worryFree')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-8 w-8 text-purple-600" />
                    <span>{t('product.helpFromHumans')}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('product.needHelp')}</h4>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/contact')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
                      {t('product.requestConsultation')}
                    </button>
                    <button
                      onClick={() => navigate('/downloads?category=brochures')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
                      {t('product.downloadBrochure')}
                    </button>
                    <button onClick={() => navigate('/contact')} className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
                      {t('product.contactSales')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
  className={`mobile-order-sticky lg:hidden fixed bottom-0 left-0 right-0 grid gap-2 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 ${
    isConfigurableProduct && hasSpareParts
      ? 'grid-cols-3'
      : (isConfigurableProduct || hasSpareParts)
        ? 'grid-cols-2'
        : 'grid-cols-1'
  }`}
>
  <button
    onClick={() => {
      setSelectedProductId(product.id.toString());
      setShowOrderModal(true);
    }}
    className={`mobile-order-button min-w-0 flex h-full min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[11px] font-medium leading-tight text-white rounded-lg transition-colors ${
      isConfigurableProduct
        ? "bg-brandgreen hover:bg-green-900"
        : "bg-brandgreen hover:bg-green-900 w-full"
    }`}
  >
    <ShoppingCart className="h-5 w-5" />
    <span className="block w-full break-words">{t('product.order')}</span>
  </button>

  {isConfigurableProduct && (
    <button
      onClick={() => showProductToast(product)}
      className="mobile-order-button min-w-0 flex h-full min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[11px] font-medium leading-tight rounded-lg border border-brandgreen text-brandgreen bg-white dark:bg-gray-800 hover:bg-brandgreen hover:text-white transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <span className="block w-full break-words">{t('product.configure')}</span>
    </button>
  )}

  {hasSpareParts && (
    <button
      onClick={() => setIsSparePartsModalOpen(true)}
      className="mobile-order-button min-w-0 flex h-full min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[11px] font-medium leading-tight rounded-lg border border-brandgreen text-brandgreen bg-white dark:bg-gray-800 hover:bg-brandgreen hover:text-white transition-colors"
      aria-label={t('spareParts.jumpButton', { defaultValue: 'Open Spare Parts' })}
    >
      <Wrench className="h-5 w-5" />
      <span className="block w-full break-words">{t('spareParts.jumpButton', { defaultValue: 'Open Spare Parts' })}</span>
    </button>
  )}
</div>

      {hasSpareParts && sparePartsCatalog && (
        <SparePartsSection
          machineName={product.name || sparePartsCatalog.machineName}
          catalog={sparePartsCatalog}
          activeModel={sparePartsModel}
          isOpen={isSparePartsModalOpen}
          onClose={() => setIsSparePartsModalOpen(false)}
        />
      )}


      {showOrderModal && selectedProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setShowOrderModal(false);
            setSelectedProductId(null);
          }}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => {
                setShowOrderModal(false);
                setSelectedProductId(null);
              }}
              aria-label={t('commons.close')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <OrderNow
              productId={selectedProductId}
              productName={product.name}
              onClose={() => {
                setShowOrderModal(false);
                setSelectedProductId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;