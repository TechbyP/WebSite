export interface SparePartHotspot {
  id: string;
  pos: number;
  x: number;
  y: number;
  articleNumbers?: string[];
}

export type SparePartsHotspotCatalogMap = Record<string, Record<string, SparePartHotspot[]>>;

export const SPARE_PARTS_HOTSPOTS: SparePartsHotspotCatalogMap = {
  'mp-shared': {
    mp_page_06: [
      { id: 'mp_page_06_pos_1', pos: 1, x: 0.334, y: 0.468 },
      { id: 'mp_page_06_pos_2', pos: 2, x: 0.334, y: 0.659 },
      { id: 'mp_page_06_pos_3', pos: 3, x: 0.645, y: 0.185 },
      { id: 'mp_page_06_pos_4', pos: 4, x: 0.334, y: 0.820 },
      { id: 'mp_page_06_pos_5', pos: 5, x: 0.658, y: 0.807 },
      { id: 'mp_page_06_pos_6', pos: 6, x: 0.378, y: 0.157 },
      { id: 'mp_page_06_pos_7', pos: 7, x: 0.704, y: 0.660 },
    ],
  },
};
