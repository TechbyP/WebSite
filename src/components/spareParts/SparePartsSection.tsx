import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHeader } from '../../pages/Header';
import type {
  SparePartItem,
  SparePartsCatalog,
  SparePartsModelKey,
} from '../../data/sparePartsCatalog';

type BasketItem = SparePartItem & {
  assemblyId: string;
  assemblyTitle: string;
  quantity: number;
};

type Props = {
  machineName: string;
  catalog: SparePartsCatalog;
  activeModel?: SparePartsModelKey;
  isOpen: boolean;
  onClose: () => void;
};

const getItemKey = (assemblyId: string, articleNumber: string) =>
  `${assemblyId}:${articleNumber}`;

const getPartTranslationKey = (articleNumber: string) =>
  articleNumber.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const clampQuantity = (value: number) => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(999, Math.max(1, Math.floor(value)));
};

const quantityButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';

const compactQuantityButtonClass =
  'inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';

const basketQuantityButtonClass =
  'inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';

const parseStoredBasket = (value: string | null): BasketItem[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as BasketItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) =>
        item &&
        typeof item === 'object' &&
        typeof item.articleNumber === 'string' &&
        typeof item.name === 'string' &&
        typeof item.pos === 'number' &&
        typeof item.defaultQty === 'number' &&
        typeof item.quantity === 'number' &&
        typeof item.assemblyId === 'string' &&
        typeof item.assemblyTitle === 'string'
      )
      .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }));
  } catch {
    return [];
  }
};

export default function SparePartsSection({ machineName, catalog, activeModel, isOpen, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { isVisible: isHeaderVisible, height: headerHeight } = useHeader();
  const storageKey = `${catalog.storageKey}:${activeModel || 'all'}`;
  const [activeAssemblyId, setActiveAssemblyId] = useState<string>(catalog.assemblies[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedQuantities, setRequestedQuantities] = useState<Record<string, number>>({});
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [basketItems, setBasketItems] = useState<BasketItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    return parseStoredBasket(window.localStorage.getItem(storageKey));
  });

  const visibleAssemblies = useMemo(
    () =>
      catalog.assemblies.filter(
        (assembly) => !activeModel || !assembly.models?.length || assembly.models.includes(activeModel)
      ),
    [activeModel, catalog.assemblies]
  );

  const activeAssembly = useMemo(
    () => visibleAssemblies.find((assembly) => assembly.id === activeAssemblyId) || visibleAssemblies[0],
    [activeAssemblyId, visibleAssemblies]
  );

  const shouldShowAssemblyImage = activeAssembly?.id !== 'mp_page_11';

  const getAssemblyTitle = (assemblyId: string) =>
    catalog.id === 'dh-de'
      ? t(`spareParts.assemblies.${assemblyId}`, {
          defaultValue: catalog.assemblies.find((assembly) => assembly.id === assemblyId)?.title || assemblyId,
        })
      : t(`spareParts.catalogs.${catalog.id}.assemblies.${assemblyId}`, {
          defaultValue: catalog.assemblies.find((assembly) => assembly.id === assemblyId)?.title || assemblyId,
        });

  const sectionTitle =
    catalog.id === 'dh-de'
      ? t('spareParts.sectionTitle', { defaultValue: catalog.sectionTitle })
      : t(`spareParts.catalogs.${catalog.id}.sectionTitle`, {
          defaultValue: catalog.sectionTitle,
        });

  const sectionDescription =
    catalog.id === 'dh-de'
      ? t('spareParts.sectionDescription', { defaultValue: catalog.sectionDescription })
      : t(`spareParts.catalogs.${catalog.id}.sectionDescription`, {
          defaultValue: catalog.sectionDescription,
        });

  const getPartName = (part: Pick<SparePartItem, 'articleNumber' | 'name'>) =>
    t(`spareParts.parts.${getPartTranslationKey(part.articleNumber)}`, {
      defaultValue: part.name,
    });

  useEffect(() => {
    if (!activeAssembly && visibleAssemblies.length > 0) {
      setActiveAssemblyId(visibleAssemblies[0].id);
    }
  }, [activeAssembly, visibleAssemblies]);

  useEffect(() => {
    setActiveAssemblyId(catalog.assemblies[0]?.id || '');
    setSearchTerm('');
    setRequestedQuantities({});
    setIsImageViewerOpen(false);
  }, [catalog.id]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setBasketItems(parseStoredBasket(window.localStorage.getItem(storageKey)));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(basketItems));
  }, [basketItems, storageKey]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isImageViewerOpen) {
          setIsImageViewerOpen(false);
          return;
        }

        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageViewerOpen, isOpen, onClose]);

  useEffect(() => {
    if (!shouldShowAssemblyImage && isImageViewerOpen) {
      setIsImageViewerOpen(false);
    }
  }, [isImageViewerOpen, shouldShowAssemblyImage]);

  const activeAssemblyItems = useMemo(
    () =>
      (activeAssembly?.items || []).filter(
        (item) => !activeModel || !item.models?.length || item.models.includes(activeModel)
      ),
    [activeAssembly?.items, activeModel]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeAssemblyItems;
    }

    return activeAssemblyItems.filter((item) =>
      item.articleNumber.toLowerCase().includes(normalizedSearch) ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      getPartName(item).toLowerCase().includes(normalizedSearch) ||
      String(item.pos).includes(normalizedSearch)
    );
  }, [activeAssemblyItems, i18n.language, searchTerm]);

  const totalLineItems = basketItems.length;
  const totalUnits = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToBasket = (part: SparePartItem) => {
    if (!activeAssembly) {
      return;
    }

    const key = getItemKey(activeAssembly.id, part.articleNumber);
    const requested = clampQuantity(requestedQuantities[key] ?? part.defaultQty ?? 1);

    setBasketItems((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.assemblyId === activeAssembly.id && item.articleNumber === part.articleNumber
      );

      if (existingIndex === -1) {
        return [
          ...previous,
          {
            ...part,
            quantity: requested,
            assemblyId: activeAssembly.id,
            assemblyTitle: getAssemblyTitle(activeAssembly.id),
          },
        ];
      }

      return previous.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: clampQuantity(item.quantity + requested) }
          : item
      );
    });
  };

  const updateRequestedQuantity = (assemblyId: string, articleNumber: string, quantity: number) => {
    const key = getItemKey(assemblyId, articleNumber);
    const next = clampQuantity(quantity);

    setRequestedQuantities((previous) => ({
      ...previous,
      [key]: next,
    }));
  };

  const nudgeRequestedQuantity = (assemblyId: string, articleNumber: string, delta: number) => {
    const key = getItemKey(assemblyId, articleNumber);
    const currentItem = activeAssembly?.items.find((item) => item.articleNumber === articleNumber);
    const fallback = currentItem?.defaultQty ?? 1;
    const currentValue = requestedQuantities[key] ?? fallback;

    updateRequestedQuantity(assemblyId, articleNumber, currentValue + delta);
  };

  const updateBasketQuantity = (assemblyId: string, articleNumber: string, quantity: number) => {
    setBasketItems((previous) =>
      previous.map((item) =>
        item.assemblyId === assemblyId && item.articleNumber === articleNumber
          ? { ...item, quantity: clampQuantity(quantity) }
          : item
      )
    );
  };

  const nudgeBasketQuantity = (assemblyId: string, articleNumber: string, delta: number) => {
    const currentItem = basketItems.find(
      (item) => item.assemblyId === assemblyId && item.articleNumber === articleNumber
    );

    if (!currentItem) {
      return;
    }

    updateBasketQuantity(assemblyId, articleNumber, currentItem.quantity + delta);
  };

  const removeBasketItem = (assemblyId: string, articleNumber: string) => {
    setBasketItems((previous) =>
      previous.filter(
        (item) => !(item.assemblyId === assemblyId && item.articleNumber === articleNumber)
      )
    );
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  const requestByEmail = () => {
    const subject = t('spareParts.emailSubject', {
      machineName,
      defaultValue: '{{machineName}} spare parts request',
    });

    const lines = basketItems.map(
      (item) =>
        `- ${t('spareParts.emailLineItem', {
          quantity: item.quantity,
          articleNumber: item.articleNumber,
          pos: item.pos,
          partName: getPartName(item),
          assembly: getAssemblyTitle(item.assemblyId),
          defaultValue: '{{quantity}}x {{articleNumber}} (POS {{pos}}) - {{partName}} [{{assembly}}]',
        })}`
    );

    const body = [
      t('spareParts.emailGreeting', { defaultValue: 'Hello TECHBYP team,' }),
      '',
      t('spareParts.emailIntro', {
        machineName,
        defaultValue: 'Please send me a quote for these spare parts for {{machineName}}:',
      }),
      ...lines,
      '',
      t('spareParts.emailTotalPositions', {
        lineItems: totalLineItems,
        defaultValue: 'Total positions: {{lineItems}}',
      }),
      t('spareParts.emailTotalUnits', {
        units: totalUnits,
        defaultValue: 'Total units: {{units}}',
      }),
      '',
      t('spareParts.emailCompany', { defaultValue: 'Company:' }),
      t('spareParts.emailContactPerson', { defaultValue: 'Contact person:' }),
      t('spareParts.emailPhone', { defaultValue: 'Phone:' }),
      t('spareParts.emailDeliveryCountry', { defaultValue: 'Delivery country:' }),
      '',
      t('spareParts.emailThanks', { defaultValue: 'Thank you.' }),
    ].join('\n');

    window.location.href = `mailto:info@bodenprobetechnik.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!isOpen) {
    return null;
  }

  const mobileTopInset = isHeaderVisible ? Math.max(headerHeight, 56) : 0;
  const mobileModalOffsetStyle = {
    '--spare-parts-modal-top': `calc(${mobileTopInset}px + env(safe-area-inset-top, 0px))`,
  } as CSSProperties;

  if (!activeAssembly) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[var(--spare-parts-modal-top)] sm:inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      style={mobileModalOffsetStyle}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={sectionTitle}
        className="w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[92vh] overflow-y-auto overscroll-contain border border-gray-200 dark:border-gray-700 rounded-none sm:rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sm:sticky sm:top-0 z-10 -mx-4 sm:mx-0 mb-4 sm:mb-6 px-4 sm:px-0 py-3 sm:py-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-800/80 flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white">
              {sectionTitle}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {sectionDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('commons.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {visibleAssemblies.map((assembly) => (
            <button
              key={assembly.id}
              type="button"
              onClick={() => setActiveAssemblyId(assembly.id)}
              className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors ${
                activeAssembly.id === assembly.id
                  ? 'bg-brandblue text-white border-brandblue'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-brandblue'
              }`}
            >
              {getAssemblyTitle(assembly.id)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('spareParts.searchPlaceholder', {
                  defaultValue: 'Search by POS, article number, or name...',
                })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2 lg:hidden">
              {filteredItems.map((part) => {
                const key = getItemKey(activeAssembly.id, part.articleNumber);
                const value = requestedQuantities[key] ?? part.defaultQty;

                return (
                  <article
                    key={key}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <p className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t('spareParts.pos', { defaultValue: 'POS' })} {part.pos}
                      </p>
                      <p className="shrink-0 text-xs font-semibold text-gray-900 dark:text-gray-100">{part.articleNumber}</p>
                      <p className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-gray-300" title={getPartName(part)}>
                        {getPartName(part)}
                      </p>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, -1)}
                          className={compactQuantityButtonClass}
                          aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="inline-flex min-w-7 items-center justify-center rounded border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-xs text-gray-900 dark:text-gray-100">
                          {value}
                        </span>

                        <button
                          type="button"
                          onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, 1)}
                          className={compactQuantityButtonClass}
                          aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => addToBasket(part)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-brandgreen text-white hover:bg-green-900"
                          aria-label={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                        >
                          <ShoppingBasket className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">{t('spareParts.pos', { defaultValue: 'POS' })}</th>
                    <th className="px-3 py-2 text-left">{t('spareParts.articleNumber', { defaultValue: 'Article Number' })}</th>
                    <th className="px-3 py-2 text-left">{t('spareParts.partName', { defaultValue: 'Part Name' })}</th>
                    <th className="px-3 py-2 text-left">{t('spareParts.qty', { defaultValue: 'Qty' })}</th>
                    <th className="px-3 py-2 text-left">{t('spareParts.add', { defaultValue: 'Add' })}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {filteredItems.map((part) => {
                    const key = getItemKey(activeAssembly.id, part.articleNumber);
                    const value = requestedQuantities[key] ?? part.defaultQty;

                    return (
                      <tr key={key} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">{part.pos}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{part.articleNumber}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{getPartName(part)}</td>
                        <td className="px-3 py-2 w-40">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, -1)}
                              className={quantityButtonClass}
                              aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={value}
                              onChange={(event) => {
                                updateRequestedQuantity(
                                  activeAssembly.id,
                                  part.articleNumber,
                                  Number(event.target.value)
                                );
                              }}
                              className="no-spinner w-16 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, 1)}
                              className={quantityButtonClass}
                              aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => addToBasket(part)}
                            className="px-3 py-1 rounded bg-brandgreen text-white hover:bg-green-900"
                          >
                            {t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="order-1 lg:order-2 lg:col-span-1">
            <div className="lg:sticky lg:top-2 space-y-4">
              {shouldShowAssemblyImage && (
                <button
                  type="button"
                  onClick={() => setIsImageViewerOpen(true)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
                  aria-label={t('spareParts.openImage', { defaultValue: 'Open full-size image' })}
                >
                  <div className="h-44 sm:h-56 lg:h-64 w-full overflow-hidden rounded bg-white">
                    <img
                      src={activeAssembly.imageUrl}
                      alt={t('spareParts.assemblyImageAlt', {
                        assembly: getAssemblyTitle(activeAssembly.id),
                        defaultValue: '{{assembly}} exploded view',
                      })}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 text-center">
                    {t('spareParts.clickToEnlarge', { defaultValue: 'Click image to enlarge' })}
                  </p>
                </button>
              )}

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingBasket className="h-5 w-5" />
                    {t('spareParts.basket', { defaultValue: 'Basket' })}
                  </h3>
                  {basketItems.length > 0 && (
                    <button
                      type="button"
                      onClick={clearBasket}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      {t('spareParts.clear', { defaultValue: 'Clear' })}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  {t('spareParts.basketSummary', {
                    defaultValue: '{{lineItems}} line items / {{units}} units',
                    lineItems: totalLineItems,
                    units: totalUnits,
                  })}
                </p>

                {basketItems.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('spareParts.emptyBasket', { defaultValue: 'No parts selected yet.' })}
                  </p>
                ) : (
                  <ul className="space-y-1 mb-4 max-h-56 sm:max-h-72 lg:max-h-[28rem] overflow-auto pr-1">
                    {basketItems.map((item) => {
                      const itemKey = getItemKey(item.assemblyId, item.articleNumber);

                      return (
                        <li
                          key={itemKey}
                          className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <p
                              className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-gray-200"
                              title={`${item.articleNumber} - ${getPartName(item)} - ${getAssemblyTitle(item.assemblyId)}`}
                            >
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{item.articleNumber}</span>
                              <span className="mx-1 text-gray-400">-</span>
                              <span>{getPartName(item)}</span>
                              <span className="mx-1 text-gray-400">-</span>
                              <span className="text-gray-500 dark:text-gray-400">{getAssemblyTitle(item.assemblyId)}</span>
                            </p>

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => nudgeBasketQuantity(item.assemblyId, item.articleNumber, -1)}
                                className={basketQuantityButtonClass}
                                aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>

                              <span className="inline-flex min-w-7 items-center justify-center rounded border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-xs text-gray-900 dark:text-gray-100 lg:hidden">
                                {item.quantity}
                              </span>

                              <input
                                type="number"
                                min={1}
                                max={999}
                                value={item.quantity}
                                onChange={(event) =>
                                  updateBasketQuantity(
                                    item.assemblyId,
                                    item.articleNumber,
                                    Number(event.target.value)
                                  )
                                }
                                className="no-spinner hidden w-14 rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-center text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 lg:block"
                              />

                              <button
                                type="button"
                                onClick={() => nudgeBasketQuantity(item.assemblyId, item.articleNumber, 1)}
                                className={basketQuantityButtonClass}
                                aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => removeBasketItem(item.assemblyId, item.articleNumber)}
                                className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                                aria-label={t('spareParts.remove', { defaultValue: 'Remove item' })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={requestByEmail}
                  disabled={basketItems.length === 0}
                  className="w-full rounded-lg px-4 py-2 bg-brandgreen text-white hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('spareParts.requestQuote', { defaultValue: 'Request quote by email' })}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {isImageViewerOpen && shouldShowAssemblyImage && (
          <div
            className="fixed inset-x-0 bottom-0 top-[var(--spare-parts-modal-top)] sm:inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
            style={mobileModalOffsetStyle}
            onClick={() => setIsImageViewerOpen(false)}
          >
            <div
              className="relative max-w-[95vw] max-h-[92vh]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsImageViewerOpen(false)}
                className="absolute -top-3 -right-3 rounded-full bg-white text-gray-700 p-2 shadow"
                aria-label={t('commons.close')}
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={activeAssembly.imageUrl}
                alt={t('spareParts.assemblyImageFullAlt', {
                  assembly: getAssemblyTitle(activeAssembly.id),
                  defaultValue: '{{assembly}} full-size exploded view',
                })}
                className="max-w-[95vw] max-h-[88vh] object-contain rounded-lg bg-white"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
