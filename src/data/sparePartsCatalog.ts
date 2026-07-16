import { DH_DE_SPARE_PARTS_ASSEMBLIES, DH_DE_SPARE_PARTS_PRODUCT_IDS } from './sparePartsDhDe';
import { GENERATED_SPARE_PARTS_CATALOGS } from './sparePartsGenerated';
import { SPARE_PARTS_HOTSPOTS, type SparePartHotspot } from './sparePartsHotspots';
import towerImage from '../assets/Technical/generated/spare-parts/dh-de/spare-parts-page-2.png?url';
import earthContainerImage from '../assets/Technical/generated/spare-parts/dh-de/spare-parts-page-3.png?url';
import carriageImage from '../assets/Technical/generated/spare-parts/dh-de/spare-parts-page-4.png?url';

export type SparePartsModelKey = 'mp_1_90' | 'mp_2_60' | 'mp_3_90' | 'mp_4_100';

export interface SparePartItem {
  pos: number;
  articleNumber: string;
  name: string;
  defaultQty: number;
  models?: SparePartsModelKey[];
}

export interface SparePartsAssembly {
  id: string;
  title: string;
  imageUrl: string;
  items: SparePartItem[];
  models?: SparePartsModelKey[];
  hotspots?: SparePartHotspot[];
}

export interface SparePartsCatalog {
  id: string;
  machineName: string;
  sectionTitle: string;
  sectionDescription: string;
  storageKey: string;
  productIds: number[];
  modelByProductId?: Record<string, SparePartsModelKey>;
  assemblies: SparePartsAssembly[];
}

const DH_DE_ASSEMBLY_IMAGES: Record<string, string> = {
  tower: towerImage,
  earth_container: earthContainerImage,
  carriage: carriageImage,
};

const dhDeCatalog: SparePartsCatalog = {
  id: 'dh-de',
  machineName: 'DH/DE',
  sectionTitle: 'DH/DE Ersatzteile',
  sectionDescription:
    'Waehlen Sie ein oder mehrere Teile aus den Explosionszeichnungen aus, legen Sie sie in den Warenkorb und senden Sie eine Angebotsanfrage.',
  storageKey: 'techbyp-spare-parts-dh-de',
  productIds: [...DH_DE_SPARE_PARTS_PRODUCT_IDS],
  assemblies: DH_DE_SPARE_PARTS_ASSEMBLIES.map((assembly) => ({
    id: assembly.id,
    title: assembly.title,
    imageUrl: DH_DE_ASSEMBLY_IMAGES[assembly.id],
    items: assembly.items.map((item) => ({ ...item })),
  })),
};

const withAssemblyHotspots = (catalog: SparePartsCatalog): SparePartsCatalog => {
  const catalogHotspots = SPARE_PARTS_HOTSPOTS[catalog.id];

  if (!catalogHotspots) {
    return catalog;
  }

  return {
    ...catalog,
    assemblies: catalog.assemblies.map((assembly) => ({
      ...assembly,
      hotspots: catalogHotspots[assembly.id],
    })),
  };
};

export const SPARE_PARTS_CATALOGS: SparePartsCatalog[] = [
  withAssemblyHotspots(dhDeCatalog),
  ...GENERATED_SPARE_PARTS_CATALOGS.map(withAssemblyHotspots),
];

export const findSparePartsCatalogForProduct = (
  productId: number,
  catalogs: SparePartsCatalog[]
): SparePartsCatalog | undefined => catalogs.find((catalog) => catalog.productIds.includes(productId));

export const getSparePartsCatalogForProduct = (productId: number): SparePartsCatalog | undefined =>
  findSparePartsCatalogForProduct(productId, SPARE_PARTS_CATALOGS);

export const getSparePartsModelForProduct = (
  catalog: SparePartsCatalog,
  productId: number
): SparePartsModelKey | undefined => catalog.modelByProductId?.[String(productId)];
