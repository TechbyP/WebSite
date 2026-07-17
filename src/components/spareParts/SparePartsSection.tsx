import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Search, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHeader } from '../../pages/Header';
import type { SparePartHotspot } from '../../data/sparePartsHotspots';
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
  editingEnabled?: boolean;
  onHotspotsSaved?: (assemblyId: string, hotspots: SparePartHotspot[]) => void;
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

const basketQuantityButtonClass =
  'inline-flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';

const HOTSPOT_HOVER_RADIUS = 0.045;
const HOTSPOT_TUNING_STORAGE_KEY = 'techbyp-spare-parts-hotspot-overrides';

const sanitizeArticleKey = (articleNumber: string) =>
  articleNumber.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const getManualHotspotPrefix = (assemblyId: string, articleNumber: string) =>
  `manual_${assemblyId}_${sanitizeArticleKey(articleNumber)}`;

const getNextManualHotspotId = (
  assemblyId: string,
  articleNumber: string,
  hotspots: SparePartHotspot[]
) => {
  const prefix = getManualHotspotPrefix(assemblyId, articleNumber);
  let maxIndex = 0;

  for (const hotspot of hotspots) {
    if (hotspot.id === prefix) {
      maxIndex = Math.max(maxIndex, 1);
      continue;
    }

    if (!hotspot.id.startsWith(`${prefix}_`)) {
      continue;
    }

    const suffix = hotspot.id.slice(prefix.length + 1);
    const parsedIndex = Number.parseInt(suffix, 10);
    if (Number.isFinite(parsedIndex)) {
      maxIndex = Math.max(maxIndex, parsedIndex);
    }
  }

  return `${prefix}_${maxIndex + 1}`;
};

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

const parseStoredHotspotOverrides = (value: string | null): Record<string, SparePartHotspot[]> => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Record<string, SparePartHotspot[]>;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const normalizedEntries: Array<[string, SparePartHotspot[]]> = [];

    for (const [key, hotspots] of Object.entries(parsed)) {
      if (!Array.isArray(hotspots)) {
        continue;
      }

      const normalized = hotspots.filter(
        (hotspot) =>
          hotspot &&
          typeof hotspot === 'object' &&
          typeof hotspot.id === 'string' &&
          typeof hotspot.pos === 'number' &&
          typeof hotspot.x === 'number' &&
          typeof hotspot.y === 'number'
      );

      normalizedEntries.push([key, normalized]);
    }

    return Object.fromEntries(normalizedEntries);
  } catch {
    return {};
  }
};

export default function SparePartsSection({
  machineName,
  catalog,
  activeModel,
  editingEnabled = false,
  onHotspotsSaved,
  isOpen,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const { isVisible: isHeaderVisible, height: headerHeight } = useHeader();
  const storageKey = `${catalog.storageKey}:${activeModel || 'all'}`;
  const [activeAssemblyId, setActiveAssemblyId] = useState<string>(catalog.assemblies[0]?.id || '');
  const [requestedQuantities, setRequestedQuantities] = useState<Record<string, number>>({});
  const [showHotspotMarkers, setShowHotspotMarkers] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isHotspotTuningMode, setIsHotspotTuningMode] = useState(false);
  const [tuningSelectedArticleNumber, setTuningSelectedArticleNumber] = useState<string | null>(null);
  const [tuningDraftHotspots, setTuningDraftHotspots] = useState<SparePartHotspot[]>([]);
  const [tuningCopyFeedback, setTuningCopyFeedback] = useState<string | null>(null);
  const [runtimeHotspotOverrides, setRuntimeHotspotOverrides] = useState<Record<string, SparePartHotspot[]>>(() => {
    if (typeof window === 'undefined' || !editingEnabled) {
      return {};
    }

    return parseStoredHotspotOverrides(window.localStorage.getItem(HOTSPOT_TUNING_STORAGE_KEY));
  });
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [activeHotspotArticleNumber, setActiveHotspotArticleNumber] = useState<string | null>(null);
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

  const canEditHotspots = editingEnabled;
  const shouldShowAssemblyImage =
    Boolean(activeAssembly?.imageUrl) && activeAssembly?.id !== 'mp_page_11';

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

  const activeAssemblyItems = useMemo(
    () =>
      (activeAssembly?.items || []).filter(
        (item) => !activeModel || !item.models?.length || item.models.includes(activeModel)
      ),
    [activeAssembly?.items, activeModel]
  );

  const configuredAssemblyHotspots = activeAssembly?.hotspots || [];
  const hotspotOverrideKey = `${catalog.id}:${activeAssembly?.id || ''}`;
  const overriddenHotspots = canEditHotspots ? runtimeHotspotOverrides[hotspotOverrideKey] || [] : [];

  const autoGeneratedHotspots = useMemo(() => {
    if (configuredAssemblyHotspots.length > 0 || activeAssemblyItems.length === 0) {
      return [];
    }

    const articlesByPos = new Map<number, string[]>();

    for (const item of activeAssemblyItems) {
      const entries = articlesByPos.get(item.pos) || [];
      entries.push(item.articleNumber);
      articlesByPos.set(item.pos, entries);
    }

    const byPos = [...articlesByPos.entries()].sort((left, right) => left[0] - right[0]);
    if (byPos.length === 0) {
      return [];
    }

    const rows = Math.min(18, byPos.length);
    const cols = Math.ceil(byPos.length / rows);
    const minX = 0.76;
    const maxX = 0.96;

    return byPos.map(([pos, articleNumbers], index) => {
      const row = index % rows;
      const col = Math.floor(index / rows);
      const x = cols === 1 ? maxX : minX + (maxX - minX) * (col / (cols - 1));
      const y = (row + 1) / (rows + 1);

      return {
        id: `auto_pos_${pos}_${col}_${row}`,
        pos,
        x,
        y,
        articleNumbers,
      };
    });
  }, [activeAssemblyItems, configuredAssemblyHotspots.length]);

  const defaultAssemblyHotspots = configuredAssemblyHotspots.length > 0
    ? configuredAssemblyHotspots
    : autoGeneratedHotspots;

  const assemblyHotspots = overriddenHotspots.length > 0
    ? overriddenHotspots
    : defaultAssemblyHotspots;

  const displayedHotspots = isHotspotTuningMode ? tuningDraftHotspots : assemblyHotspots;

  const hasInteractiveHotspots = shouldShowAssemblyImage && displayedHotspots.length > 0;
  const useMobileHotspotSheet = isMobileViewport || isCoarsePointer;
  const hotspotMarkerSizeClass = isCoarsePointer ? 'h-16 w-16 text-base' : 'h-14 w-14 text-sm';

  const hotspotCountByArticleNumber = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of activeAssemblyItems) {
      counts.set(item.articleNumber, 0);
    }

    for (const hotspot of tuningDraftHotspots) {
      if (hotspot.articleNumbers?.length) {
        for (const articleNumber of hotspot.articleNumbers) {
          counts.set(articleNumber, (counts.get(articleNumber) || 0) + 1);
        }
        continue;
      }

      for (const item of activeAssemblyItems) {
        if (item.pos === hotspot.pos) {
          counts.set(item.articleNumber, (counts.get(item.articleNumber) || 0) + 1);
        }
      }
    }

    return counts;
  }, [activeAssemblyItems, tuningDraftHotspots]);

  const placedArticleNumbers = useMemo(() => {
    const placed = new Set<string>();

    for (const [articleNumber, count] of hotspotCountByArticleNumber.entries()) {
      if (count > 0) {
        placed.add(articleNumber);
      }
    }

    return placed;
  }, [hotspotCountByArticleNumber]);

  const tuningExportJson = useMemo(() => {
    const sortable = [...tuningDraftHotspots].sort((left, right) => {
      if (left.pos !== right.pos) {
        return left.pos - right.pos;
      }

      return left.id.localeCompare(right.id);
    });

    return JSON.stringify(sortable, null, 2);
  }, [tuningDraftHotspots]);

  const resolveHotspotParts = (hotspotId: string | null) => {
    if (!hotspotId) {
      return [];
    }

    const hotspot = displayedHotspots.find((entry) => entry.id === hotspotId);
    if (!hotspot) {
      return [];
    }

    let matchingParts = activeAssemblyItems.filter((item) => item.pos === hotspot.pos);

    if (hotspot.articleNumbers?.length) {
      matchingParts = matchingParts.filter((item) => hotspot.articleNumbers?.includes(item.articleNumber));
    }

    return matchingParts;
  };

  const findNearestHotspot = (x: number, y: number) => {
    if (!hasInteractiveHotspots) {
      return null;
    }

    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const hotspot of displayedHotspots) {
      const dx = hotspot.x - x;
      const dy = hotspot.y - y;
      const distance = Math.hypot(dx, dy);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = hotspot.id;
      }
    }

    if (bestDistance > HOTSPOT_HOVER_RADIUS) {
      return null;
    }

    return bestId;
  };

  const activeHotspot = useMemo(
    () => displayedHotspots.find((hotspot) => hotspot.id === activeHotspotId),
    [activeHotspotId, displayedHotspots]
  );

  const hoveredHotspot = useMemo(
    () => displayedHotspots.find((hotspot) => hotspot.id === hoveredHotspotId),
    [hoveredHotspotId, displayedHotspots]
  );

  const activeHotspotParts = useMemo(() => {
    return resolveHotspotParts(activeHotspotId);
  }, [activeHotspotId, activeAssemblyItems, displayedHotspots]);

  const hoveredHotspotParts = useMemo(() => {
    return resolveHotspotParts(hoveredHotspotId);
  }, [hoveredHotspotId, activeAssemblyItems, displayedHotspots]);

  const hoveredHotspotPreviewPart = hoveredHotspotParts[0];

  const selectedHotspotPart = useMemo(() => {
    if (!activeHotspotParts.length) {
      return undefined;
    }

    if (!activeHotspotArticleNumber) {
      return activeHotspotParts[0];
    }

    return activeHotspotParts.find((part) => part.articleNumber === activeHotspotArticleNumber) || activeHotspotParts[0];
  }, [activeHotspotArticleNumber, activeHotspotParts]);

  const selectedHotspotQuantity = useMemo(() => {
    if (!activeAssembly || !selectedHotspotPart) {
      return 1;
    }

    const key = getItemKey(activeAssembly.id, selectedHotspotPart.articleNumber);
    return requestedQuantities[key] ?? selectedHotspotPart.defaultQty;
  }, [activeAssembly, requestedQuantities, selectedHotspotPart]);

  const isHotspotPopoverAbove = (activeHotspot?.y ?? 0) > 0.25;
  const desktopHotspotPopoverHorizontalClass =
    (activeHotspot?.x ?? 0.5) < 0.2
      ? 'translate-x-0'
      : (activeHotspot?.x ?? 0.5) > 0.8
        ? '-translate-x-full'
        : '-translate-x-1/2';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateViewportState = () => {
      setIsMobileViewport(window.innerWidth < 768);
      setIsCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
    };

    updateViewportState();
    window.addEventListener('resize', updateViewportState);

    return () => {
      window.removeEventListener('resize', updateViewportState);
    };
  }, []);

  useEffect(() => {
    if (!activeAssembly && visibleAssemblies.length > 0) {
      setActiveAssemblyId(visibleAssemblies[0].id);
    }
  }, [activeAssembly, visibleAssemblies]);

  useEffect(() => {
    setActiveHotspotId(null);
    setHoveredHotspotId(null);
    setActiveHotspotArticleNumber(null);
    setIsHotspotTuningMode(false);
    setIsImageZoomed(false);
    setTuningCopyFeedback(null);
  }, [activeAssemblyId]);

  useEffect(() => {
    if (canEditHotspots) {
      return;
    }

    setIsHotspotTuningMode(false);
  }, [canEditHotspots]);

  useEffect(() => {
    setActiveAssemblyId(catalog.assemblies[0]?.id || '');
    setRequestedQuantities({});
    setShowHotspotMarkers(false);
    setIsImageZoomed(false);
    setIsHotspotTuningMode(false);
    setTuningSelectedArticleNumber(null);
    setTuningDraftHotspots([]);
    setTuningCopyFeedback(null);
    setActiveHotspotId(null);
    setHoveredHotspotId(null);
    setActiveHotspotArticleNumber(null);
  }, [catalog.id]);

  useEffect(() => {
    if (!isOpen) {
      setIsImageZoomed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setTuningDraftHotspots(
      assemblyHotspots.map((hotspot) => ({
        ...hotspot,
        articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
      }))
    );

    setTuningSelectedArticleNumber(activeAssemblyItems[0]?.articleNumber || null);
  }, [activeAssemblyId, activeAssemblyItems, assemblyHotspots]);

  const updateTuningHotspot = (articleNumber: string, x: number, y: number) => {
    const selectedPart = activeAssemblyItems.find((item) => item.articleNumber === articleNumber);
    if (!selectedPart) {
      return;
    }

    const assemblyIdForHotspot = activeAssembly?.id || 'assembly';
    const constrainedX = Math.max(0, Math.min(1, x));
    const constrainedY = Math.max(0, Math.min(1, y));

    const existingPointsForArticle = tuningDraftHotspots.filter((hotspot) =>
      hotspot.articleNumbers?.includes(articleNumber)
    ).length;
    const shouldAdvanceToNextPart = existingPointsForArticle === 0;

    setTuningDraftHotspots((previous) => {
      return [
        ...previous,
        {
          id: getNextManualHotspotId(assemblyIdForHotspot, articleNumber, previous),
          pos: selectedPart.pos,
          x: constrainedX,
          y: constrainedY,
          articleNumbers: [articleNumber],
        },
      ];
    });

    if (!shouldAdvanceToNextPart) {
      return;
    }

    const currentIndex = activeAssemblyItems.findIndex((item) => item.articleNumber === articleNumber);
    if (currentIndex >= 0 && activeAssemblyItems.length > 1) {
      const nextItem = activeAssemblyItems[(currentIndex + 1) % activeAssemblyItems.length];
      setTuningSelectedArticleNumber(nextItem.articleNumber);
    }
  };

  const clearTuningHotspot = (articleNumber: string) => {
    setTuningDraftHotspots((previous) =>
      previous.filter((hotspot) => !hotspot.articleNumbers?.includes(articleNumber))
    );
  };

  const copyTuningHotspotsToClipboard = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setTuningCopyFeedback(t('spareParts.copyHotspotsFailed', { defaultValue: 'Clipboard unavailable' }));
      return;
    }

    const block = `"${activeAssembly?.id}": ${tuningExportJson}`;

    try {
      await navigator.clipboard.writeText(block);
      setTuningCopyFeedback(t('spareParts.copyHotspotsSuccess', { defaultValue: 'Hotspots copied' }));
    } catch {
      setTuningCopyFeedback(t('spareParts.copyHotspotsFailed', { defaultValue: 'Copy failed' }));
    }
  };

  const saveTuningHotspotsForAssembly = () => {
    if (!activeAssembly?.id) {
      return;
    }

    const normalizedHotspots = tuningDraftHotspots.map((hotspot) => ({
      ...hotspot,
      articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
    }));

    setRuntimeHotspotOverrides((previous) => ({
      ...previous,
      [hotspotOverrideKey]: normalizedHotspots,
    }));

    onHotspotsSaved?.(activeAssembly.id, normalizedHotspots);

    setTuningCopyFeedback(t('spareParts.saveHotspotsSuccess', { defaultValue: 'Hotspots saved for this assembly' }));
  };

  const resetTunedHotspotsForAssembly = () => {
    if (!activeAssembly?.id) {
      return;
    }

    setRuntimeHotspotOverrides((previous) => {
      const next = { ...previous };
      delete next[hotspotOverrideKey];
      return next;
    });

    setTuningDraftHotspots(
      defaultAssemblyHotspots.map((hotspot) => ({
        ...hotspot,
        articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
      }))
    );

    setTuningCopyFeedback(t('spareParts.resetHotspotsSuccess', { defaultValue: 'Assembly hotspots reset' }));
  };

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
    if (typeof window === 'undefined' || !canEditHotspots) {
      return;
    }

    window.localStorage.setItem(HOTSPOT_TUNING_STORAGE_KEY, JSON.stringify(runtimeHotspotOverrides));
  }, [canEditHotspots, runtimeHotspotOverrides]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false);
          return;
        }

        if (activeHotspotId) {
          setActiveHotspotId(null);
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
  }, [activeHotspotId, isImageZoomed, isOpen, onClose]);

  useEffect(() => {
    if (!activeHotspot) {
      setActiveHotspotArticleNumber(null);
      return;
    }

    if (!activeHotspotParts.length) {
      setActiveHotspotArticleNumber(null);
      return;
    }

    if (!activeHotspotArticleNumber || !activeHotspotParts.some((part) => part.articleNumber === activeHotspotArticleNumber)) {
      setActiveHotspotArticleNumber(activeHotspotParts[0].articleNumber);
    }
  }, [activeHotspot, activeHotspotArticleNumber, activeHotspotParts]);

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

  const addSelectedHotspotPartToBasket = () => {
    if (!selectedHotspotPart) {
      return;
    }

    addToBasket(selectedHotspotPart);
    setActiveHotspotId(null);
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

  const basketPanel = (
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
  );

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

  const sortedAssemblyItems = [...activeAssemblyItems].sort(
    (left, right) => left.pos - right.pos || left.articleNumber.localeCompare(right.articleNumber)
  );

  const partsListPanel = (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white">
          {t('spareParts.partsListTitle', { defaultValue: 'Parts list' })}
        </h3>
        <p className="text-[11px] text-gray-600 dark:text-gray-300">
          {t('spareParts.partsCount', {
            defaultValue: '{{count}} parts',
            count: sortedAssemblyItems.length,
          })}
        </p>
      </div>

      {sortedAssemblyItems.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('spareParts.noPartsForAssembly', { defaultValue: 'No parts found for this assembly.' })}
        </p>
      ) : (
        <ul className="space-y-1 max-h-[34rem] overflow-auto pr-1">
          {sortedAssemblyItems.map((part, partIndex) => {
            const quantityKey = getItemKey(activeAssembly.id, part.articleNumber);
            const partRowKey = `${quantityKey}:${part.pos}:${partIndex}`;
            const quantity = requestedQuantities[quantityKey] ?? part.defaultQty;

            return (
              <li
                key={partRowKey}
                className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      {t('spareParts.pos', { defaultValue: 'POS' })} {part.pos}
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100" title={part.articleNumber}>
                      {part.articleNumber}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300" title={getPartName(part)}>
                      {getPartName(part)}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, -1)}
                      className={basketQuantityButtonClass}
                      aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={quantity}
                      onChange={(event) =>
                        updateRequestedQuantity(
                          activeAssembly.id,
                          part.articleNumber,
                          Number(event.target.value)
                        )
                      }
                      className="no-spinner w-14 rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-center text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => nudgeRequestedQuantity(activeAssembly.id, part.articleNumber, 1)}
                      className={basketQuantityButtonClass}
                      aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => addToBasket(part)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded bg-brandgreen text-white hover:bg-green-900"
                      aria-label={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                      title={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                    >
                      <ShoppingBasket className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const interactiveViewportClassName = isImageZoomed
    ? 'fixed left-1/2 top-1/2 z-[85] w-[min(95vw,1500px)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-2xl'
    : 'relative w-full overflow-visible rounded bg-white';

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
        className="w-full h-full sm:h-[92vh] sm:max-w-[98vw] 2xl:max-w-[1920px] overflow-y-auto overscroll-contain border border-gray-200 dark:border-gray-700 rounded-none sm:rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6"
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

        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,1fr)] items-start">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2">
                {shouldShowAssemblyImage ? (
                  <>
                    <div className="mb-2 flex flex-wrap justify-end gap-2">
                      {canEditHotspots && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsHotspotTuningMode((current) => {
                              const next = !current;
                              if (next) {
                                setShowHotspotMarkers(true);
                              }
                              return next;
                            });
                            setActiveHotspotId(null);
                            setHoveredHotspotId(null);
                          }}
                          className={`rounded border px-2 py-1 text-xs ${
                            isHotspotTuningMode
                              ? 'border-brandblue bg-brandblue text-white'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {isHotspotTuningMode
                            ? t('spareParts.exitTuningMode', { defaultValue: 'Exit tuning mode' })
                            : t('spareParts.enterTuningMode', { defaultValue: 'Tune hotspots' })}
                        </button>
                      )}

                      {canEditHotspots && (hasInteractiveHotspots || isHotspotTuningMode) && (
                        <button
                          type="button"
                          onClick={() => setShowHotspotMarkers((current) => !current)}
                          className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {showHotspotMarkers
                            ? t('spareParts.hideInteractiveMarkers', { defaultValue: 'Hide markers' })
                            : t('spareParts.showInteractiveMarkers', { defaultValue: 'Show markers' })}
                        </button>
                      )}

                      {shouldShowAssemblyImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsImageZoomed(true);
                            setActiveHotspotId(null);
                            setHoveredHotspotId(null);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label={t('spareParts.enlargeView', { defaultValue: 'Enlarge view' })}
                          title={t('spareParts.enlargeView', { defaultValue: 'Enlarge view' })}
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {canEditHotspots && isHotspotTuningMode && (
                      <div className="mb-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-xs text-gray-700 dark:text-gray-200 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label htmlFor="hotspot-part-select" className="font-semibold">
                            {t('spareParts.tuningPart', { defaultValue: 'Part to place' })}
                          </label>
                          <select
                            id="hotspot-part-select"
                            value={tuningSelectedArticleNumber || ''}
                            onChange={(event) => setTuningSelectedArticleNumber(event.target.value || null)}
                            className="min-w-[220px] rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          >
                            {activeAssemblyItems.map((part) => {
                              const pointCount = hotspotCountByArticleNumber.get(part.articleNumber) || 0;
                              return (
                                <option key={part.articleNumber} value={part.articleNumber}>
                                  [{pointCount}] POS {part.pos} - {part.articleNumber}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (tuningSelectedArticleNumber) {
                                clearTuningHotspot(tuningSelectedArticleNumber);
                              }
                            }}
                            disabled={!tuningSelectedArticleNumber}
                            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs disabled:opacity-50"
                          >
                            {t('spareParts.clearSelectedHotspot', { defaultValue: 'Clear selected part points' })}
                          </button>

                          <button
                            type="button"
                            onClick={() => setTuningDraftHotspots([])}
                            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs"
                          >
                            {t('spareParts.clearAssemblyHotspots', { defaultValue: 'Clear assembly points' })}
                          </button>

                          <button
                            type="button"
                            onClick={saveTuningHotspotsForAssembly}
                            className="rounded border border-brandblue px-2 py-1 text-xs text-brandblue hover:bg-brandblue hover:text-white"
                          >
                            {t('spareParts.saveHotspots', { defaultValue: 'Save assembly hotspots' })}
                          </button>

                          <button
                            type="button"
                            onClick={resetTunedHotspotsForAssembly}
                            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs"
                          >
                            {t('spareParts.resetHotspots', { defaultValue: 'Reset to default hotspots' })}
                          </button>

                          <button
                            type="button"
                            onClick={() => void copyTuningHotspotsToClipboard()}
                            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs"
                          >
                            {t('spareParts.copyHotspots', { defaultValue: 'Copy hotspots JSON' })}
                          </button>

                          <span className="text-[11px] text-gray-600 dark:text-gray-300">
                            {placedArticleNumbers.size}/{activeAssemblyItems.length} {t('spareParts.tuningPlaced', { defaultValue: 'parts placed' })} | {tuningDraftHotspots.length} {t('spareParts.hotspotPoints', { defaultValue: 'points' })}
                          </span>

                          {tuningCopyFeedback && (
                            <span className="text-[11px] text-brandblue">{tuningCopyFeedback}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {isImageZoomed && (
                      <button
                        type="button"
                        className="fixed inset-0 z-[84] cursor-zoom-out bg-black/30"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsImageZoomed(false);
                          setActiveHotspotId(null);
                          setHoveredHotspotId(null);
                        }}
                        aria-label={t('spareParts.closeZoom', { defaultValue: 'Close zoom' })}
                      />
                    )}

                    <div
                      className={interactiveViewportClassName}
                      onPointerMove={(event) => {
                        if (!hasInteractiveHotspots || activeHotspotId || isHotspotTuningMode || useMobileHotspotSheet) {
                          return;
                        }

                        const rect = event.currentTarget.getBoundingClientRect();
                        const relativeX = (event.clientX - rect.left) / rect.width;
                        const relativeY = (event.clientY - rect.top) / rect.height;
                        const nearestHotspotId = findNearestHotspot(relativeX, relativeY);

                        setHoveredHotspotId((current) => (current === nearestHotspotId ? current : nearestHotspotId));
                      }}
                      onPointerLeave={() => {
                        if (!activeHotspotId && !isHotspotTuningMode) {
                          setHoveredHotspotId(null);
                        }
                      }}
                      onClick={(event) => {
                        if (isHotspotTuningMode && tuningSelectedArticleNumber) {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const relativeX = (event.clientX - rect.left) / rect.width;
                          const relativeY = (event.clientY - rect.top) / rect.height;
                          updateTuningHotspot(tuningSelectedArticleNumber, relativeX, relativeY);
                          return;
                        }

                        setActiveHotspotId(null);
                      }}
                    >
                      {isImageZoomed && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsImageZoomed(false);
                            setActiveHotspotId(null);
                            setHoveredHotspotId(null);
                          }}
                          className="absolute right-2 top-2 z-[90] rounded border border-gray-300 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('spareParts.closeZoom', { defaultValue: 'Close zoom' })}
                        </button>
                      )}

                      <img
                        src={activeAssembly.imageUrl}
                        alt={t('spareParts.assemblyImageAlt', {
                          assembly: getAssemblyTitle(activeAssembly.id),
                          defaultValue: '{{assembly}} exploded view',
                        })}
                        className="block w-full h-auto"
                        loading="lazy"
                      />

                      {displayedHotspots.map((hotspot) => {
                        const isActive = hotspot.id === activeHotspotId;
                        const isHovered = hotspot.id === hoveredHotspotId;
                        const showMarker = showHotspotMarkers || isActive || isHovered;

                        return (
                          <button
                            key={hotspot.id}
                            type="button"
                            className={`absolute -translate-x-1/2 -translate-y-1/2 ${hotspotMarkerSizeClass} rounded-full border font-bold transition-none ${
                              showMarker
                                ? (isActive
                                  ? 'bg-brandblue border-brandblue text-white'
                                  : 'bg-white border-gray-700 text-gray-900 hover:bg-gray-100')
                                : 'bg-transparent border-transparent text-transparent'
                            }`}
                            style={{
                              left: `${hotspot.x * 100}%`,
                              top: `${hotspot.y * 100}%`,
                              zIndex: isActive ? 30 : isHovered ? 25 : 15,
                            }}
                            onFocus={() => setHoveredHotspotId(hotspot.id)}
                            onBlur={() => setHoveredHotspotId((current) => (current === hotspot.id ? null : current))}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isHotspotTuningMode) {
                                return;
                              }
                              setActiveHotspotId((current) => (current === hotspot.id ? null : hotspot.id));
                            }}
                            aria-label={t('spareParts.openHotspot', {
                              pos: hotspot.pos,
                              defaultValue: 'Open part selector for POS {{pos}}',
                            })}
                          >
                            {hotspot.pos}
                          </button>
                        );
                      })}

                      {!isHotspotTuningMode && hasInteractiveHotspots && hoveredHotspot && hoveredHotspotPreviewPart && activeHotspotId !== hoveredHotspot.id && (
                        <div
                          className="pointer-events-none absolute z-[26] w-auto max-w-[20rem] rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-[11px] shadow-lg -translate-x-1/2 -translate-y-[120%]"
                          style={{
                            left: `${hoveredHotspot.x * 100}%`,
                            top: `${hoveredHotspot.y * 100}%`,
                          }}
                        >
                          <p className="text-center font-semibold text-gray-900 dark:text-gray-100" title={hoveredHotspotPreviewPart.articleNumber}>
                            {hoveredHotspotPreviewPart.articleNumber}
                          </p>
                          <p className="text-center text-gray-700 dark:text-gray-300" title={getPartName(hoveredHotspotPreviewPart)}>
                            {getPartName(hoveredHotspotPreviewPart)}
                          </p>
                          {hoveredHotspotParts.length > 1 && (
                            <p className="mt-1 text-center text-[10px] text-gray-500 dark:text-gray-400">
                              {t('spareParts.moreHotspotParts', {
                                count: hoveredHotspotParts.length - 1,
                                defaultValue: '+{{count}} more part options',
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      {!isHotspotTuningMode && hasInteractiveHotspots && activeHotspot && selectedHotspotPart && !useMobileHotspotSheet && (
                        <div
                          className={`absolute z-[65] w-[min(18rem,calc(100vw-1rem))] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2.5 shadow-lg ${desktopHotspotPopoverHorizontalClass} ${
                            isHotspotPopoverAbove ? '-translate-y-[112%]' : 'translate-y-3'
                          }`}
                          style={{
                            left: `${activeHotspot.x * 100}%`,
                            top: `${activeHotspot.y * 100}%`,
                          }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <p className="mb-1 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            {t('spareParts.pos', { defaultValue: 'POS' })} {activeHotspot.pos}
                          </p>

                          {activeHotspotParts.length > 1 && (
                            <select
                              value={selectedHotspotPart.articleNumber}
                              onChange={(event) => setActiveHotspotArticleNumber(event.target.value)}
                              className="mb-2 w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            >
                              {activeHotspotParts.map((part) => (
                                <option key={part.articleNumber} value={part.articleNumber}>
                                  {part.articleNumber} - {getPartName(part)}
                                </option>
                              ))}
                            </select>
                          )}

                          <p className="truncate text-center text-sm font-bold text-gray-900 dark:text-gray-100" title={selectedHotspotPart.articleNumber}>
                            {selectedHotspotPart.articleNumber}
                          </p>
                          <p className="mb-2 truncate text-center text-xs text-gray-700 dark:text-gray-300" title={getPartName(selectedHotspotPart)}>
                            {getPartName(selectedHotspotPart)}
                          </p>

                          <div className="mx-auto flex w-36 items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                nudgeRequestedQuantity(activeAssembly.id, selectedHotspotPart.articleNumber, -1)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                              aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="inline-flex flex-1 items-center justify-center rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xl font-black leading-none text-gray-900 dark:text-gray-100">
                              {selectedHotspotQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                nudgeRequestedQuantity(activeAssembly.id, selectedHotspotPart.articleNumber, 1)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                              aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={addSelectedHotspotPartToBasket}
                            className="mx-auto mt-2 flex h-8 w-36 items-center justify-center rounded bg-brandgreen text-white hover:bg-green-900"
                            aria-label={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                            title={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                          >
                            <ShoppingBasket className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {!isHotspotTuningMode && hasInteractiveHotspots && activeHotspot && selectedHotspotPart && useMobileHotspotSheet && (
                        <div
                          className="fixed inset-x-2 bottom-2 z-[78] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 shadow-2xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              {t('spareParts.pos', { defaultValue: 'POS' })} {activeHotspot.pos}
                            </p>

                            <button
                              type="button"
                              onClick={() => setActiveHotspotId(null)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                              aria-label={t('commons.close')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {activeHotspotParts.length > 1 && (
                            <select
                              value={selectedHotspotPart.articleNumber}
                              onChange={(event) => setActiveHotspotArticleNumber(event.target.value)}
                              className="mb-2 w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            >
                              {activeHotspotParts.map((part) => (
                                <option key={part.articleNumber} value={part.articleNumber}>
                                  {part.articleNumber} - {getPartName(part)}
                                </option>
                              ))}
                            </select>
                          )}

                          <p className="truncate text-center text-sm font-bold text-gray-900 dark:text-gray-100" title={selectedHotspotPart.articleNumber}>
                            {selectedHotspotPart.articleNumber}
                          </p>
                          <p className="mb-2 truncate text-center text-xs text-gray-700 dark:text-gray-300" title={getPartName(selectedHotspotPart)}>
                            {getPartName(selectedHotspotPart)}
                          </p>

                          <div className="mx-auto flex w-full max-w-52 items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                nudgeRequestedQuantity(activeAssembly.id, selectedHotspotPart.articleNumber, -1)
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                              aria-label={t('spareParts.decreaseQty', { defaultValue: 'Decrease quantity' })}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>

                            <span className="inline-flex flex-1 items-center justify-center rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xl font-black leading-none text-gray-900 dark:text-gray-100">
                              {selectedHotspotQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                nudgeRequestedQuantity(activeAssembly.id, selectedHotspotPart.articleNumber, 1)
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                              aria-label={t('spareParts.increaseQty', { defaultValue: 'Increase quantity' })}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={addSelectedHotspotPartToBasket}
                            className="mx-auto mt-2 flex h-10 w-full max-w-52 items-center justify-center rounded bg-brandgreen text-white hover:bg-green-900"
                            aria-label={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                            title={t('spareParts.addToBasket', { defaultValue: 'Add to basket' })}
                          >
                            <ShoppingBasket className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {t('spareParts.noInteractiveImage', {
                      defaultValue: 'Interactive diagram is unavailable for this assembly.',
                    })}
                  </p>
                )}

                {shouldShowAssemblyImage && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 text-center">
                    {isHotspotTuningMode
                      ? t('spareParts.tuningHint', {
                          defaultValue: 'Select a part, then click the image to add hotspot points. Click again to add multiple points for the same POS.',
                        })
                      : hasInteractiveHotspots
                        ? t('spareParts.clickDiagramNumbers', {
                            defaultValue: 'Click diagram numbers to set quantity and add parts',
                          })
                        : t('spareParts.noInteractivePoints', {
                            defaultValue: 'Interactive points are not configured for this diagram yet.',
                          })}
                  </p>
                )}
              </div>

              <div>{partsListPanel}</div>
            </div>

            <div>
              {basketPanel}
            </div>
          </div>
      </section>
    </div>
  );
}


