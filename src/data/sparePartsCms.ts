import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  SparePartItem,
  SparePartsAssembly,
  SparePartsCatalog,
  SparePartsModelKey,
} from './sparePartsCatalog';
import type { SparePartHotspot } from './sparePartsHotspots';

const SPARE_PARTS_COLLECTION = 'sparePartsCatalogs';
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

const normalizeModelKey = (value: unknown): SparePartsModelKey | undefined => {
  if (value === 'mp_1_90' || value === 'mp_2_60' || value === 'mp_3_90' || value === 'mp_4_100') {
    return value;
  }

  return undefined;
};

const normalizeModelKeys = (value: unknown): SparePartsModelKey[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((entry) => normalizeModelKey(entry))
    .filter((entry): entry is SparePartsModelKey => Boolean(entry));

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeItems = (items: unknown): SparePartItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const source = item as Record<string, unknown>;
      if (
        typeof source.pos !== 'number' ||
        typeof source.articleNumber !== 'string' ||
        typeof source.name !== 'string' ||
        typeof source.defaultQty !== 'number'
      ) {
        return undefined;
      }

      return {
        pos: source.pos,
        articleNumber: source.articleNumber,
        name: source.name,
        defaultQty: source.defaultQty,
        models: normalizeModelKeys(source.models),
      } satisfies SparePartItem;
    })
    .filter((item): item is SparePartItem => Boolean(item));
};

const normalizeHotspots = (hotspots: unknown): SparePartHotspot[] | undefined => {
  if (!Array.isArray(hotspots)) {
    return undefined;
  }

  const normalized = hotspots
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return undefined;
      }

      const source = entry as Record<string, unknown>;
      if (
        typeof source.id !== 'string' ||
        typeof source.pos !== 'number' ||
        typeof source.x !== 'number' ||
        typeof source.y !== 'number'
      ) {
        return undefined;
      }

      const articleNumbers = Array.isArray(source.articleNumbers)
        ? source.articleNumbers.filter((value): value is string => typeof value === 'string')
        : undefined;

      return {
        id: source.id,
        pos: source.pos,
        x: source.x,
        y: source.y,
        articleNumbers: articleNumbers && articleNumbers.length > 0 ? articleNumbers : undefined,
      } satisfies SparePartHotspot;
    })
    .filter((entry): entry is SparePartHotspot => Boolean(entry));

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeAssemblies = (assemblies: unknown): SparePartsAssembly[] => {
  if (!Array.isArray(assemblies)) {
    return [];
  }

  return assemblies
    .map((assembly) => {
      if (!assembly || typeof assembly !== 'object') {
        return undefined;
      }

      const source = assembly as Record<string, unknown>;

      if (
        typeof source.id !== 'string' ||
        typeof source.title !== 'string' ||
        typeof source.imageUrl !== 'string'
      ) {
        return undefined;
      }

      return {
        id: source.id,
        title: source.title,
        imageUrl: source.imageUrl,
        items: normalizeItems(source.items),
        models: normalizeModelKeys(source.models),
        hotspots: normalizeHotspots(source.hotspots),
      } satisfies SparePartsAssembly;
    })
    .filter((assembly): assembly is SparePartsAssembly => Boolean(assembly));
};

const normalizeCatalog = (id: string, payload: DocumentData): SparePartsCatalog | undefined => {
  const productIds = Array.isArray(payload.productIds)
    ? payload.productIds.filter((entry): entry is number => typeof entry === 'number')
    : [];

  const modelByProductIdSource = payload.modelByProductId && typeof payload.modelByProductId === 'object'
    ? payload.modelByProductId as Record<string, unknown>
    : {};

  const modelByProductIdEntries = Object.entries(modelByProductIdSource)
    .map(([productId, model]) => {
      const normalized = normalizeModelKey(model);
      return normalized ? [productId, normalized] : undefined;
    })
    .filter((entry): entry is [string, SparePartsModelKey] => Boolean(entry));

  if (
    typeof payload.machineName !== 'string' ||
    typeof payload.sectionTitle !== 'string' ||
    typeof payload.sectionDescription !== 'string' ||
    typeof payload.storageKey !== 'string'
  ) {
    return undefined;
  }

  return {
    id,
    machineName: payload.machineName,
    sectionTitle: payload.sectionTitle,
    sectionDescription: payload.sectionDescription,
    storageKey: payload.storageKey,
    productIds,
    modelByProductId: Object.fromEntries(modelByProductIdEntries),
    assemblies: normalizeAssemblies(payload.assemblies),
  } satisfies SparePartsCatalog;
};

export const cloneSparePartsCatalog = (catalog: SparePartsCatalog): SparePartsCatalog => ({
  ...catalog,
  productIds: [...catalog.productIds],
  modelByProductId: catalog.modelByProductId ? { ...catalog.modelByProductId } : undefined,
  assemblies: catalog.assemblies.map((assembly) => ({
    ...assembly,
    models: assembly.models ? [...assembly.models] : undefined,
    hotspots: assembly.hotspots?.map((hotspot) => ({
      ...hotspot,
      articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
    })),
    items: assembly.items.map((item) => ({
      ...item,
      models: item.models ? [...item.models] : undefined,
    })),
  })),
});

const cloneHotspot = (hotspot: SparePartHotspot): SparePartHotspot => ({
  ...hotspot,
  articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
});

const cloneItem = (item: SparePartItem): SparePartItem => ({
  ...item,
  models: item.models ? [...item.models] : undefined,
});

const cloneAssembly = (assembly: SparePartsAssembly): SparePartsAssembly => ({
  ...assembly,
  models: assembly.models ? [...assembly.models] : undefined,
  hotspots: assembly.hotspots?.map(cloneHotspot),
  items: assembly.items.map(cloneItem),
});

const getAssemblyItemKey = (item: SparePartItem) => `${item.pos}:${item.articleNumber}`;

const hasArticleNumberDigits = (item: SparePartItem) => /\d/.test(item.articleNumber);

const mergeAssemblyItems = (
  baseItems: SparePartItem[],
  managedItems: SparePartItem[]
): SparePartItem[] => {
  const itemsByPos = new Map<number, SparePartItem[]>();

  for (const managedItem of managedItems) {
    const entry = cloneItem(managedItem);
    const bucket = itemsByPos.get(entry.pos) || [];
    bucket.push(entry);
    itemsByPos.set(entry.pos, bucket);
  }

  // If a POS already has at least one valid article number, discard malformed fallback rows.
  for (const [pos, items] of itemsByPos.entries()) {
    const hasValidItem = items.some(hasArticleNumberDigits);
    if (!hasValidItem) {
      continue;
    }

    itemsByPos.set(pos, items.filter(hasArticleNumberDigits));
  }

  for (const baseItem of baseItems) {
    const bucket = itemsByPos.get(baseItem.pos) || [];
    const baseKey = getAssemblyItemKey(baseItem);

    if (bucket.some((entry) => getAssemblyItemKey(entry) === baseKey)) {
      continue;
    }

    if (bucket.length === 0) {
      itemsByPos.set(baseItem.pos, [cloneItem(baseItem)]);
      continue;
    }

    const allMalformed = bucket.every((entry) => !hasArticleNumberDigits(entry));
    if (allMalformed && hasArticleNumberDigits(baseItem)) {
      itemsByPos.set(baseItem.pos, [cloneItem(baseItem)]);
    }
  }

  return [...itemsByPos.entries()]
    .sort((left, right) => left[0] - right[0])
    .flatMap(([, items]) =>
      [...items].sort((left, right) => left.articleNumber.localeCompare(right.articleNumber))
    );
};

export const mergeManagedSparePartsCatalogWithBase = (
  baseCatalog: SparePartsCatalog,
  managedCatalog: SparePartsCatalog
): SparePartsCatalog => {
  const baseAssembliesById = new Map(baseCatalog.assemblies.map((assembly) => [assembly.id, assembly]));
  const managedAssembliesById = new Map(managedCatalog.assemblies.map((assembly) => [assembly.id, assembly]));

  const assemblies: SparePartsAssembly[] = [];

  for (const baseAssembly of baseCatalog.assemblies) {
    const managedAssembly = managedAssembliesById.get(baseAssembly.id);

    if (!managedAssembly) {
      assemblies.push(cloneAssembly(baseAssembly));
      continue;
    }

    assemblies.push({
      ...cloneAssembly(baseAssembly),
      ...cloneAssembly(managedAssembly),
      title: managedAssembly.title || baseAssembly.title,
      imageUrl: managedAssembly.imageUrl || baseAssembly.imageUrl,
      models: managedAssembly.models ?? baseAssembly.models,
      hotspots:
        managedAssembly.hotspots !== undefined
          ? managedAssembly.hotspots.map(cloneHotspot)
          : baseAssembly.hotspots?.map(cloneHotspot),
      items: mergeAssemblyItems(baseAssembly.items, managedAssembly.items),
    });
  }

  for (const managedAssembly of managedCatalog.assemblies) {
    if (baseAssembliesById.has(managedAssembly.id)) {
      continue;
    }

    assemblies.push(cloneAssembly(managedAssembly));
  }

  return {
    ...cloneSparePartsCatalog(baseCatalog),
    ...cloneSparePartsCatalog(managedCatalog),
    assemblies,
  };
};

const stripUndefinedDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stripUndefinedDeep(entry))
      .filter((entry) => entry !== undefined);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => {
        const normalized = stripUndefinedDeep(entry);
        if (normalized === undefined) {
          return [];
        }

        return [[key, normalized] as [string, unknown]];
      });

    return Object.fromEntries(entries);
  }

  return value;
};

export const loadManagedSparePartsCatalogs = async (): Promise<SparePartsCatalog[]> => {
  const snapshot = await getDocs(collection(db, SPARE_PARTS_COLLECTION));
  const catalogs: SparePartsCatalog[] = [];

  snapshot.forEach((catalogDoc) => {
    const normalized = normalizeCatalog(catalogDoc.id, catalogDoc.data());
    if (normalized) {
      catalogs.push(normalized);
    }
  });

  return catalogs;
};

export const saveManagedSparePartsCatalog = async (catalog: SparePartsCatalog): Promise<void> => {
  const payload = stripUndefinedDeep({
    ...catalog,
    updatedAt: Date.now(),
  }) as DocumentData;

  await setDoc(doc(db, SPARE_PARTS_COLLECTION, catalog.id), payload);
};

export const deleteManagedSparePartsCatalog = async (catalogId: string): Promise<void> => {
  await deleteDoc(doc(db, SPARE_PARTS_COLLECTION, catalogId));
};

const sanitizePathSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entry';

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.split(',')[1];

      if (!base64) {
        reject(new Error('Invalid image payload'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

export const uploadSparePartsAssemblyImage = async (
  catalogId: string,
  assemblyId: string,
  file: File
): Promise<string> => {
  if (!IMGBB_API_KEY) {
    throw new Error('Missing VITE_IMGBB_KEY for image uploads');
  }

  const safeCatalogId = sanitizePathSegment(catalogId);
  const safeAssemblyId = sanitizePathSegment(assemblyId);
  const safeFileName = sanitizePathSegment(file.name);
  const timestamp = Date.now();
  const base64Image = await toBase64(file);
  const formData = new FormData();

  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64Image);
  formData.append('name', `${safeCatalogId}-${safeAssemblyId}-${timestamp}-${safeFileName}`);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { url?: string };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error?.message || 'Image upload failed');
  }

  return payload.data.url;
};
