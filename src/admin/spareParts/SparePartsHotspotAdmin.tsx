import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import SparePartsSection from '../../components/spareParts/SparePartsSection';
import { createProducts } from '../../data/products';
import {
  SPARE_PARTS_CATALOGS,
  type SparePartItem,
  type SparePartsAssembly,
  type SparePartsCatalog,
  type SparePartsModelKey,
} from '../../data/sparePartsCatalog';
import type { SparePartHotspot } from '../../data/sparePartsHotspots';
import {
  cloneSparePartsCatalog,
  deleteManagedSparePartsCatalog,
  loadManagedSparePartsCatalogs,
  mergeManagedSparePartsCatalogWithBase,
  saveManagedSparePartsCatalog,
  uploadSparePartsAssemblyImage,
} from '../../data/sparePartsCms';

type Props = {
  isDarkMode: boolean;
};

const HOTSPOT_TUNING_STORAGE_KEY = 'techbyp-spare-parts-hotspot-overrides';
const MODEL_OPTIONS: SparePartsModelKey[] = ['mp_1_90', 'mp_2_60', 'mp_3_90', 'mp_4_100'];

const createCatalogSkeleton = (id: string): SparePartsCatalog => ({
  id,
  machineName: 'New Spare Parts Catalog',
  sectionTitle: 'Spare Parts',
  sectionDescription: 'Select parts and request a quote.',
  storageKey: `techbyp-spare-parts-${id}`,
  productIds: [],
  modelByProductId: {},
  assemblies: [],
});

const createAssemblySkeleton = (index: number): SparePartsAssembly => ({
  id: `assembly_${index}`,
  title: `Assembly ${index}`,
  imageUrl: '',
  items: [],
  hotspots: [],
});

const createItemSkeleton = (index: number): SparePartItem => ({
  pos: index,
  articleNumber: `NEW-${index}`,
  name: 'New part',
  defaultQty: 1,
});

const createHotspotSkeleton = (index: number): SparePartHotspot => ({
  id: `hs_${index}`,
  pos: index,
  x: 0.5,
  y: 0.5,
});

const parseModelCsv = (value: string): SparePartsModelKey[] | undefined => {
  const rawEntries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const normalized = rawEntries.filter((entry): entry is SparePartsModelKey =>
    MODEL_OPTIONS.includes(entry as SparePartsModelKey)
  );

  return normalized.length > 0 ? normalized : undefined;
};

const modelCsvValue = (value: SparePartsModelKey[] | undefined): string =>
  value?.join(', ') || '';

const articleCsvValue = (value: string[] | undefined): string => value?.join(', ') || '';

const parseArticleCsv = (value: string): string[] | undefined => {
  const normalized = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
};

const sanitizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function SparePartsHotspotAdmin({ isDarkMode }: Props) {
  const { t, i18n } = useTranslation();
  const [catalogs, setCatalogs] = useState<SparePartsCatalog[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState('');
  const [liveEditorModelFilter, setLiveEditorModelFilter] = useState('all');
  const [isBusy, setIsBusy] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(false);

  const allProducts = useMemo(
    () => createProducts(t).sort((left, right) => left.id - right.id),
    [i18n.language, i18n.resolvedLanguage, t]
  );

  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.id === selectedCatalogId),
    [catalogs, selectedCatalogId]
  );

  const selectedAssembly = useMemo(
    () => selectedCatalog?.assemblies.find((assembly) => assembly.id === selectedAssemblyId),
    [selectedAssemblyId, selectedCatalog]
  );

  const availableModelFilters = useMemo(() => {
    if (!selectedCatalog?.modelByProductId) {
      return [] as SparePartsModelKey[];
    }

    return [...new Set(Object.values(selectedCatalog.modelByProductId))].sort();
  }, [selectedCatalog]);

  const liveEditorModel =
    liveEditorModelFilter === 'all' ? undefined : (liveEditorModelFilter as SparePartsModelKey);

  const loadCatalogs = async () => {
    setIsBusy(true);

    try {
      const managedCatalogs = await loadManagedSparePartsCatalogs();
      const mergedCatalogs = new Map<string, SparePartsCatalog>();

      for (const catalog of SPARE_PARTS_CATALOGS) {
        mergedCatalogs.set(catalog.id, catalog);
      }

      for (const catalog of managedCatalogs) {
        const baseCatalog = mergedCatalogs.get(catalog.id);
        if (baseCatalog) {
          mergedCatalogs.set(catalog.id, mergeManagedSparePartsCatalogWithBase(baseCatalog, catalog));
          continue;
        }

        mergedCatalogs.set(catalog.id, catalog);
      }

      const sourceCatalogs = [...mergedCatalogs.values()];
      const editableCatalogs = sourceCatalogs.map((catalog) => cloneSparePartsCatalog(catalog));

      setCatalogs(editableCatalogs);
      setSelectedCatalogId(editableCatalogs[0]?.id || '');
      setSelectedAssemblyId(editableCatalogs[0]?.assemblies[0]?.id || '');
    } catch {
      const fallbackCatalogs = SPARE_PARTS_CATALOGS.map((catalog) => cloneSparePartsCatalog(catalog));
      setCatalogs(fallbackCatalogs);
      setSelectedCatalogId(fallbackCatalogs[0]?.id || '');
      setSelectedAssemblyId(fallbackCatalogs[0]?.assemblies[0]?.id || '');
      toast.error(t('sparePartsAdmin.loadError', { defaultValue: 'Failed to load managed spare parts catalogs.' }));
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void loadCatalogs();
  }, []);

  useEffect(() => {
    if (!selectedCatalog) {
      setSelectedAssemblyId('');
      return;
    }

    if (!selectedAssemblyId || !selectedCatalog.assemblies.some((assembly) => assembly.id === selectedAssemblyId)) {
      setSelectedAssemblyId(selectedCatalog.assemblies[0]?.id || '');
    }
  }, [selectedAssemblyId, selectedCatalog]);

  useEffect(() => {
    if (liveEditorModelFilter !== 'all' && !availableModelFilters.includes(liveEditorModelFilter as SparePartsModelKey)) {
      setLiveEditorModelFilter('all');
    }
  }, [availableModelFilters, liveEditorModelFilter]);

  const updateSelectedCatalog = (updater: (catalog: SparePartsCatalog) => SparePartsCatalog) => {
    if (!selectedCatalog) {
      return;
    }

    setCatalogs((previous) =>
      previous.map((catalog) => (catalog.id === selectedCatalog.id ? updater(catalog) : catalog))
    );
  };

  const updateSelectedAssembly = (updater: (assembly: SparePartsAssembly) => SparePartsAssembly) => {
    if (!selectedCatalog || !selectedAssembly) {
      return;
    }

    updateSelectedCatalog((catalog) => ({
      ...catalog,
      assemblies: catalog.assemblies.map((assembly) =>
        assembly.id === selectedAssembly.id ? updater(assembly) : assembly
      ),
    }));
  };

  const createCatalog = () => {
    const suffix = Date.now();
    let candidateId = `catalog_${suffix}`;

    while (catalogs.some((catalog) => catalog.id === candidateId)) {
      candidateId = `catalog_${Math.floor(Math.random() * 1000000)}`;
    }

    const nextCatalog = createCatalogSkeleton(candidateId);

    setCatalogs((previous) => [...previous, nextCatalog]);
    setSelectedCatalogId(candidateId);
    setSelectedAssemblyId('');
  };

  const duplicateCatalog = () => {
    if (!selectedCatalog) {
      return;
    }

    const baseId = `${selectedCatalog.id}-copy`;
    let nextId = baseId;
    let counter = 2;

    while (catalogs.some((catalog) => catalog.id === nextId)) {
      nextId = `${baseId}-${counter}`;
      counter += 1;
    }

    const duplicated = cloneSparePartsCatalog({
      ...selectedCatalog,
      id: nextId,
      storageKey: `${selectedCatalog.storageKey}-${counter}`,
    });

    setCatalogs((previous) => [...previous, duplicated]);
    setSelectedCatalogId(nextId);
    setSelectedAssemblyId(duplicated.assemblies[0]?.id || '');
  };

  const renameCatalogId = (value: string) => {
    if (!selectedCatalog) {
      return;
    }

    const nextId = sanitizeId(value);
    if (!nextId || nextId === selectedCatalog.id) {
      return;
    }

    if (catalogs.some((catalog) => catalog.id === nextId)) {
      toast.error(t('sparePartsAdmin.duplicateCatalogId', { defaultValue: 'Catalog ID already exists.' }));
      return;
    }

    setCatalogs((previous) =>
      previous.map((catalog) =>
        catalog.id === selectedCatalog.id
          ? {
              ...catalog,
              id: nextId,
              storageKey: catalog.storageKey || `techbyp-spare-parts-${nextId}`,
            }
          : catalog
      )
    );

    setSelectedCatalogId(nextId);
  };

  const deleteCatalog = async () => {
    if (!selectedCatalog) {
      return;
    }

    const confirmed = window.confirm(
      t('sparePartsAdmin.deleteCatalogConfirm', {
        defaultValue: 'Delete this catalog from managed storage?',
      })
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);

    try {
      await deleteManagedSparePartsCatalog(selectedCatalog.id);
      const nextCatalogs = catalogs.filter((catalog) => catalog.id !== selectedCatalog.id);
      setCatalogs(nextCatalogs);
      setSelectedCatalogId(nextCatalogs[0]?.id || '');
      setSelectedAssemblyId(nextCatalogs[0]?.assemblies[0]?.id || '');
      toast.success(t('sparePartsAdmin.deleteCatalogSuccess', { defaultValue: 'Catalog deleted.' }));
    } catch {
      toast.error(t('sparePartsAdmin.deleteCatalogError', { defaultValue: 'Failed to delete catalog.' }));
    } finally {
      setIsBusy(false);
    }
  };

  const saveCatalog = async () => {
    if (!selectedCatalog) {
      return;
    }

    if (!selectedCatalog.id.trim()) {
      toast.error(t('sparePartsAdmin.catalogIdRequired', { defaultValue: 'Catalog ID is required.' }));
      return;
    }

    if (!selectedCatalog.machineName.trim()) {
      toast.error(t('sparePartsAdmin.machineNameRequired', { defaultValue: 'Machine name is required.' }));
      return;
    }

    setIsBusy(true);

    try {
      await saveManagedSparePartsCatalog(selectedCatalog);
      toast.success(t('sparePartsAdmin.saveCatalogSuccess', { defaultValue: 'Catalog saved.' }));
    } catch (error) {
      const details = error instanceof Error && error.message ? ` (${error.message})` : '';
      toast.error(
        `${t('sparePartsAdmin.saveCatalogError', { defaultValue: 'Failed to save catalog.' })}${details}`
      );
    } finally {
      setIsBusy(false);
    }
  };

  const toggleProductAssignment = (productId: number, selected: boolean) => {
    updateSelectedCatalog((catalog) => {
      const currentProductIds = new Set(catalog.productIds);

      if (selected) {
        currentProductIds.add(productId);
      } else {
        currentProductIds.delete(productId);
      }

      const sortedProductIds = [...currentProductIds].sort((left, right) => left - right);

      const nextModelMap = { ...(catalog.modelByProductId || {}) };
      if (!selected) {
        delete nextModelMap[String(productId)];
      }

      return {
        ...catalog,
        productIds: sortedProductIds,
        modelByProductId: nextModelMap,
      };
    });
  };

  const updateProductModel = (productId: number, value: string) => {
    updateSelectedCatalog((catalog) => {
      const nextMap = { ...(catalog.modelByProductId || {}) };

      if (!value) {
        delete nextMap[String(productId)];
      } else {
        nextMap[String(productId)] = value as SparePartsModelKey;
      }

      return {
        ...catalog,
        modelByProductId: nextMap,
      };
    });
  };

  const addAssembly = () => {
    if (!selectedCatalog) {
      return;
    }

    const nextIndex = selectedCatalog.assemblies.length + 1;
    const nextAssembly = createAssemblySkeleton(nextIndex);

    updateSelectedCatalog((catalog) => ({
      ...catalog,
      assemblies: [...catalog.assemblies, nextAssembly],
    }));

    setSelectedAssemblyId(nextAssembly.id);
  };

  const renameAssemblyId = (value: string) => {
    if (!selectedCatalog || !selectedAssembly) {
      return;
    }

    const nextId = sanitizeId(value);
    if (!nextId || nextId === selectedAssembly.id) {
      return;
    }

    if (selectedCatalog.assemblies.some((assembly) => assembly.id === nextId)) {
      toast.error(t('sparePartsAdmin.duplicateAssemblyId', { defaultValue: 'Assembly ID already exists.' }));
      return;
    }

    updateSelectedAssembly((assembly) => ({
      ...assembly,
      id: nextId,
    }));

    setSelectedAssemblyId(nextId);
  };

  const removeAssembly = () => {
    if (!selectedCatalog || !selectedAssembly) {
      return;
    }

    updateSelectedCatalog((catalog) => ({
      ...catalog,
      assemblies: catalog.assemblies.filter((assembly) => assembly.id !== selectedAssembly.id),
    }));

    const remaining = selectedCatalog.assemblies.filter((assembly) => assembly.id !== selectedAssembly.id);
    setSelectedAssemblyId(remaining[0]?.id || '');
  };

  const updateAssemblyItems = (items: SparePartItem[]) => {
    updateSelectedAssembly((assembly) => ({
      ...assembly,
      items,
    }));
  };

  const updateAssemblyHotspots = (hotspots: SparePartHotspot[]) => {
    updateSelectedAssembly((assembly) => ({
      ...assembly,
      hotspots,
    }));
  };

  const uploadAssemblyImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !selectedCatalog || !selectedAssembly) {
      return;
    }

    setIsUploadingImage(true);

    try {
      const imageUrl = await uploadSparePartsAssemblyImage(selectedCatalog.id, selectedAssembly.id, file);
      updateSelectedAssembly((assembly) => ({
        ...assembly,
        imageUrl,
      }));
      toast.success(t('sparePartsAdmin.uploadImageSuccess', { defaultValue: 'Image uploaded.' }));
    } catch {
      toast.error(t('sparePartsAdmin.uploadImageError', { defaultValue: 'Image upload failed.' }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const importTunedHotspots = () => {
    if (!selectedCatalog || !selectedAssembly || typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(HOTSPOT_TUNING_STORAGE_KEY);
    if (!raw) {
      toast.info(t('sparePartsAdmin.importTunedEmpty', { defaultValue: 'No tuned hotspots found.' }));
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, SparePartHotspot[]>;
      const key = `${selectedCatalog.id}:${selectedAssembly.id}`;
      const hotspots = Array.isArray(parsed[key]) ? parsed[key] : [];

      const normalized = hotspots.filter(
        (hotspot) =>
          hotspot &&
          typeof hotspot.id === 'string' &&
          typeof hotspot.pos === 'number' &&
          typeof hotspot.x === 'number' &&
          typeof hotspot.y === 'number'
      );

      if (!normalized.length) {
        toast.info(t('sparePartsAdmin.importTunedEmpty', { defaultValue: 'No tuned hotspots found.' }));
        return;
      }

      updateAssemblyHotspots(
        normalized.map((hotspot) => ({
          ...hotspot,
          articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
        }))
      );

      toast.success(
        t('sparePartsAdmin.importTunedSuccess', {
          defaultValue: 'Imported {{count}} tuned hotspots.',
          count: normalized.length,
        })
      );
    } catch {
      toast.error(t('sparePartsAdmin.importTunedError', { defaultValue: 'Failed to import tuned hotspots.' }));
    }
  };

  const handleLiveEditorHotspotsSaved = async (assemblyId: string, hotspots: SparePartHotspot[]) => {
    if (!selectedCatalog) {
      return;
    }

    const normalizedHotspots = hotspots.map((hotspot) => ({
      ...hotspot,
      articleNumbers: hotspot.articleNumbers ? [...hotspot.articleNumbers] : undefined,
    }));

    const nextCatalog: SparePartsCatalog = {
      ...selectedCatalog,
      assemblies: selectedCatalog.assemblies.map((assembly) =>
        assembly.id === assemblyId
          ? {
              ...assembly,
              hotspots: normalizedHotspots,
            }
          : assembly
      ),
    };

    setCatalogs((previous) =>
      previous.map((catalog) => (catalog.id === nextCatalog.id ? nextCatalog : catalog))
    );

    try {
      await saveManagedSparePartsCatalog(nextCatalog);
      toast.success(t('sparePartsAdmin.saveCatalogSuccess', { defaultValue: 'Catalog saved.' }));
    } catch (error) {
      const details = error instanceof Error && error.message ? ` (${error.message})` : '';
      toast.error(
        `${t('sparePartsAdmin.saveCatalogError', { defaultValue: 'Failed to save catalog.' })}${details}`
      );
    }
  };

  if (!selectedCatalog) {
    return (
      <section
        className={`rounded-xl border p-6 ${
          isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-800'
        }`}
      >
        {t('sparePartsAdmin.noCatalogs', { defaultValue: 'No spare-parts catalogs available yet.' })}
      </section>
    );
  }

  return (
    <>
      <section
        className={`rounded-xl border p-6 shadow-sm ${
          isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black uppercase">
              {t('sparePartsAdmin.title', { defaultValue: 'Spare Parts CMS Editor' })}
            </h2>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('sparePartsAdmin.subtitle', {
                defaultValue:
                  'Create and manage spare-parts catalogs, assign them to products, edit tabs, parts, hotspots, and images.',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadCatalogs}
              disabled={isBusy}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t('sparePartsAdmin.reload', { defaultValue: 'Reload' })}
            </button>
            <button
              type="button"
              onClick={createCatalog}
              disabled={isBusy}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t('sparePartsAdmin.newCatalog', { defaultValue: 'New Catalog' })}
            </button>
            <button
              type="button"
              onClick={duplicateCatalog}
              disabled={isBusy}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t('sparePartsAdmin.duplicateCatalog', { defaultValue: 'Duplicate Catalog' })}
            </button>
            <button
              type="button"
              onClick={deleteCatalog}
              disabled={isBusy}
              className="rounded-lg border border-red-400 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              {t('sparePartsAdmin.deleteCatalog', { defaultValue: 'Delete Catalog' })}
            </button>
            <button
              type="button"
              onClick={() => void saveCatalog()}
              disabled={isBusy}
              className="rounded-lg bg-brandgreen px-3 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-60"
            >
              {t('sparePartsAdmin.saveCatalog', { defaultValue: 'Save Catalog' })}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{t('sparePartsAdmin.catalogSelect', { defaultValue: 'Catalog' })}</span>
            <select
              value={selectedCatalog.id}
              onChange={(event) => setSelectedCatalogId(event.target.value)}
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {catalogs.map((catalog) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.machineName} ({catalog.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{t('sparePartsAdmin.catalogId', { defaultValue: 'Catalog ID' })}</span>
            <input
              type="text"
              value={selectedCatalog.id}
              onBlur={(event) => renameCatalogId(event.target.value)}
              onChange={(event) =>
                updateSelectedCatalog((catalog) => ({
                  ...catalog,
                  id: event.target.value,
                }))
              }
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{t('sparePartsAdmin.machineName', { defaultValue: 'Machine Name' })}</span>
            <input
              type="text"
              value={selectedCatalog.machineName}
              onChange={(event) =>
                updateSelectedCatalog((catalog) => ({
                  ...catalog,
                  machineName: event.target.value,
                }))
              }
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{t('sparePartsAdmin.storageKey', { defaultValue: 'Storage Key' })}</span>
            <input
              type="text"
              value={selectedCatalog.storageKey}
              onChange={(event) =>
                updateSelectedCatalog((catalog) => ({
                  ...catalog,
                  storageKey: event.target.value,
                }))
              }
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm lg:col-span-2">
            <span className="font-semibold">{t('sparePartsAdmin.sectionTitle', { defaultValue: 'Section Title' })}</span>
            <input
              type="text"
              value={selectedCatalog.sectionTitle}
              onChange={(event) =>
                updateSelectedCatalog((catalog) => ({
                  ...catalog,
                  sectionTitle: event.target.value,
                }))
              }
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm lg:col-span-2">
            <span className="font-semibold">{t('sparePartsAdmin.sectionDescription', { defaultValue: 'Section Description' })}</span>
            <textarea
              value={selectedCatalog.sectionDescription}
              onChange={(event) =>
                updateSelectedCatalog((catalog) => ({
                  ...catalog,
                  sectionDescription: event.target.value,
                }))
              }
              rows={2}
              className={`rounded-lg border px-3 py-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </label>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-black uppercase">
            {t('sparePartsAdmin.productAssignments', { defaultValue: 'Product Assignments' })}
          </h3>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('sparePartsAdmin.productAssignmentHint', {
              defaultValue: 'Assign this spare-parts catalog to any products in your catalog and optional model mappings.',
            })}
          </p>

          <div className="mt-3 max-h-64 space-y-2 overflow-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            {allProducts.map((product) => {
              const checked = selectedCatalog.productIds.includes(product.id);
              const mappedModel = selectedCatalog.modelByProductId?.[String(product.id)] || '';

              return (
                <div key={product.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="inline-flex min-w-[20rem] items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleProductAssignment(product.id, event.target.checked)}
                    />
                    <span className="font-medium">
                      {product.id} - {product.name || t('sparePartsAdmin.unnamedProduct', { defaultValue: 'Unnamed product' })}
                    </span>
                  </label>

                  <select
                    value={mappedModel}
                    onChange={(event) => updateProductModel(product.id, event.target.value)}
                    disabled={!checked}
                    className={`rounded border px-2 py-1 text-xs disabled:opacity-50 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-900 text-gray-100'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="">{t('sparePartsAdmin.noModel', { defaultValue: 'No model filter' })}</option>
                    {MODEL_OPTIONS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">
                {t('sparePartsAdmin.assemblies', { defaultValue: 'Assemblies / Tabs' })}
              </h3>
              <button
                type="button"
                onClick={addAssembly}
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t('sparePartsAdmin.addAssembly', { defaultValue: 'Add' })}
              </button>
            </div>

            <div className="max-h-72 space-y-1 overflow-auto">
              {selectedCatalog.assemblies.map((assembly) => (
                <button
                  key={assembly.id}
                  type="button"
                  onClick={() => setSelectedAssemblyId(assembly.id)}
                  className={`block w-full rounded px-2 py-2 text-left text-xs ${
                    selectedAssembly?.id === assembly.id
                      ? 'bg-brandblue text-white'
                      : 'border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold">{assembly.title || assembly.id}</div>
                  <div className="opacity-80">{assembly.id}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 lg:col-span-2">
            {selectedAssembly ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black uppercase">
                    {t('sparePartsAdmin.assemblyEditor', { defaultValue: 'Assembly Editor' })}
                  </h3>
                  <button
                    type="button"
                    onClick={removeAssembly}
                    className="rounded border border-red-400 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    {t('sparePartsAdmin.removeAssembly', { defaultValue: 'Remove Assembly' })}
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold">{t('sparePartsAdmin.assemblyId', { defaultValue: 'Assembly ID' })}</span>
                    <input
                      type="text"
                      value={selectedAssembly.id}
                      onBlur={(event) => renameAssemblyId(event.target.value)}
                      onChange={(event) =>
                        updateSelectedAssembly((assembly) => ({
                          ...assembly,
                          id: event.target.value,
                        }))
                      }
                      className={`rounded border px-2 py-1 ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-900 text-gray-100'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold">{t('sparePartsAdmin.assemblyTitle', { defaultValue: 'Assembly Title' })}</span>
                    <input
                      type="text"
                      value={selectedAssembly.title}
                      onChange={(event) =>
                        updateSelectedAssembly((assembly) => ({
                          ...assembly,
                          title: event.target.value,
                        }))
                      }
                      className={`rounded border px-2 py-1 ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-900 text-gray-100'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs md:col-span-2">
                    <span className="font-semibold">{t('sparePartsAdmin.assemblyImageUrl', { defaultValue: 'Image URL' })}</span>
                    <input
                      type="text"
                      value={selectedAssembly.imageUrl}
                      onChange={(event) =>
                        updateSelectedAssembly((assembly) => ({
                          ...assembly,
                          imageUrl: event.target.value,
                        }))
                      }
                      className={`rounded border px-2 py-1 ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-900 text-gray-100'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </label>

                  <div className="md:col-span-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                      <input type="file" accept="image/*" className="hidden" onChange={uploadAssemblyImage} />
                      <span>
                        {isUploadingImage
                          ? t('sparePartsAdmin.uploadingImage', { defaultValue: 'Uploading image...' })
                          : t('sparePartsAdmin.uploadImage', { defaultValue: 'Upload New Image' })}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 rounded border border-gray-200 p-2 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase">
                      {t('sparePartsAdmin.items', { defaultValue: 'Spare Parts Items' })}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        updateAssemblyItems([
                          ...selectedAssembly.items,
                          createItemSkeleton(selectedAssembly.items.length + 1),
                        ])
                      }
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      {t('sparePartsAdmin.addItem', { defaultValue: 'Add Item' })}
                    </button>
                  </div>

                  <div className="max-h-72 overflow-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.itemPos', { defaultValue: 'POS' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.itemArticle', { defaultValue: 'Article' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.itemName', { defaultValue: 'Name' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.itemQty', { defaultValue: 'Qty' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.itemModels', { defaultValue: 'Models' })}
                          </th>
                          <th className="px-1 py-1 text-left"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssembly.items.map((item, index) => (
                          <tr key={`${item.articleNumber}_${index}`} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                value={item.pos}
                                onChange={(event) => {
                                  const next = [...selectedAssembly.items];
                                  next[index] = {
                                    ...item,
                                    pos: Number(event.target.value) || 0,
                                  };
                                  updateAssemblyItems(next);
                                }}
                                className={`w-14 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="text"
                                value={item.articleNumber}
                                onChange={(event) => {
                                  const next = [...selectedAssembly.items];
                                  next[index] = {
                                    ...item,
                                    articleNumber: event.target.value,
                                  };
                                  updateAssemblyItems(next);
                                }}
                                className={`w-36 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(event) => {
                                  const next = [...selectedAssembly.items];
                                  next[index] = {
                                    ...item,
                                    name: event.target.value,
                                  };
                                  updateAssemblyItems(next);
                                }}
                                className={`w-56 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                value={item.defaultQty}
                                onChange={(event) => {
                                  const next = [...selectedAssembly.items];
                                  next[index] = {
                                    ...item,
                                    defaultQty: Number(event.target.value) || 1,
                                  };
                                  updateAssemblyItems(next);
                                }}
                                className={`w-16 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="text"
                                value={modelCsvValue(item.models)}
                                placeholder={t('sparePartsAdmin.itemModelsPlaceholder', {
                                  defaultValue: 'mp_1_90, mp_2_60',
                                })}
                                onChange={(event) => {
                                  const next = [...selectedAssembly.items];
                                  next[index] = {
                                    ...item,
                                    models: parseModelCsv(event.target.value),
                                  };
                                  updateAssemblyItems(next);
                                }}
                                className={`w-40 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = selectedAssembly.items.filter((_, rowIndex) => rowIndex !== index);
                                  updateAssemblyItems(next);
                                }}
                                className="rounded border border-red-400 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              >
                                {t('sparePartsAdmin.remove', { defaultValue: 'Remove' })}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2 rounded border border-gray-200 p-2 dark:border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase">
                      {t('sparePartsAdmin.hotspots', { defaultValue: 'Hotspots' })}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsLiveEditorOpen(true)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        {t('sparePartsAdmin.openLiveEditor', { defaultValue: 'Open Live Hotspot Editor' })}
                      </button>

                      <button
                        type="button"
                        onClick={importTunedHotspots}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        {t('sparePartsAdmin.importTuned', { defaultValue: 'Import Tuned Hotspots' })}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateAssemblyHotspots([
                            ...(selectedAssembly.hotspots || []),
                            createHotspotSkeleton((selectedAssembly.hotspots?.length || 0) + 1),
                          ])
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        {t('sparePartsAdmin.addHotspot', { defaultValue: 'Add Hotspot' })}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.hotspotId', { defaultValue: 'ID' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.hotspotPos', { defaultValue: 'POS' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.hotspotX', { defaultValue: 'X' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.hotspotY', { defaultValue: 'Y' })}
                          </th>
                          <th className="px-1 py-1 text-left">
                            {t('sparePartsAdmin.hotspotArticles', { defaultValue: 'Articles' })}
                          </th>
                          <th className="px-1 py-1 text-left"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedAssembly.hotspots || []).map((hotspot, index) => (
                          <tr key={`${hotspot.id}_${index}`} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-1 py-1">
                              <input
                                type="text"
                                value={hotspot.id}
                                onChange={(event) => {
                                  const next = [...(selectedAssembly.hotspots || [])];
                                  next[index] = {
                                    ...hotspot,
                                    id: event.target.value,
                                  };
                                  updateAssemblyHotspots(next);
                                }}
                                className={`w-36 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                value={hotspot.pos}
                                onChange={(event) => {
                                  const next = [...(selectedAssembly.hotspots || [])];
                                  next[index] = {
                                    ...hotspot,
                                    pos: Number(event.target.value) || 0,
                                  };
                                  updateAssemblyHotspots(next);
                                }}
                                className={`w-16 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                step="0.001"
                                value={hotspot.x}
                                onChange={(event) => {
                                  const next = [...(selectedAssembly.hotspots || [])];
                                  next[index] = {
                                    ...hotspot,
                                    x: Number(event.target.value) || 0,
                                  };
                                  updateAssemblyHotspots(next);
                                }}
                                className={`w-20 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                step="0.001"
                                value={hotspot.y}
                                onChange={(event) => {
                                  const next = [...(selectedAssembly.hotspots || [])];
                                  next[index] = {
                                    ...hotspot,
                                    y: Number(event.target.value) || 0,
                                  };
                                  updateAssemblyHotspots(next);
                                }}
                                className={`w-20 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="text"
                                value={articleCsvValue(hotspot.articleNumbers)}
                                placeholder={t('sparePartsAdmin.hotspotArticlesPlaceholder', {
                                  defaultValue: 'A-1, A-2',
                                })}
                                onChange={(event) => {
                                  const next = [...(selectedAssembly.hotspots || [])];
                                  next[index] = {
                                    ...hotspot,
                                    articleNumbers: parseArticleCsv(event.target.value),
                                  };
                                  updateAssemblyHotspots(next);
                                }}
                                className={`w-44 rounded border px-1 py-1 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-900 text-gray-100'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = (selectedAssembly.hotspots || []).filter(
                                    (_, rowIndex) => rowIndex !== index
                                  );
                                  updateAssemblyHotspots(next);
                                }}
                                className="rounded border border-red-400 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              >
                                {t('sparePartsAdmin.remove', { defaultValue: 'Remove' })}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded border border-gray-200 p-2 text-xs dark:border-gray-700">
                  <label className="mb-1 block font-semibold">
                    {t('sparePartsAdmin.liveEditorModelFilter', { defaultValue: 'Live editor model filter' })}
                  </label>
                  <select
                    value={liveEditorModelFilter}
                    onChange={(event) => setLiveEditorModelFilter(event.target.value)}
                    className={`rounded border px-2 py-1 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-900 text-gray-100'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="all">{t('sparePartsAdmin.allModels', { defaultValue: 'All models' })}</option>
                    {availableModelFilters.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('sparePartsAdmin.noAssemblySelected', {
                  defaultValue: 'Select or create an assembly to edit tabs, parts, and hotspots.',
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      <SparePartsSection
        machineName={selectedCatalog.machineName}
        catalog={selectedCatalog}
        activeModel={liveEditorModel}
        editingEnabled
        onHotspotsSaved={(assemblyId, hotspots) => {
          void handleLiveEditorHotspotsSaved(assemblyId, hotspots);
        }}
        isOpen={isLiveEditorOpen}
        onClose={() => setIsLiveEditorOpen(false)}
      />
    </>
  );
}
