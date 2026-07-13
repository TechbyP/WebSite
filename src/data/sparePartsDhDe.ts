export type SparePartsAssemblyId = 'tower' | 'earth_container' | 'carriage';

export interface SparePartItem {
  pos: number;
  articleNumber: string;
  name: string;
  defaultQty: number;
}

export interface SparePartsAssembly {
  id: SparePartsAssemblyId;
  title: string;
  imageKey: SparePartsAssemblyId;
  items: SparePartItem[];
}

export const DH_DE_SPARE_PARTS_PRODUCT_IDS = [1004, 1005] as const;

export const DH_DE_SPARE_PARTS_ASSEMBLIES: SparePartsAssembly[] = [
  {
    "id": "tower",
    "title": "Tower",
    "imageKey": "tower",
    "items": [
      {
        "pos": 1,
        "articleNumber": "DH.100.00-03",
        "name": "Aluprofil",
        "defaultQty": 1
      },
      {
        "pos": 2,
        "articleNumber": "DH.101.00",
        "name": "Linearfuhrung",
        "defaultQty": 1
      },
      {
        "pos": 3,
        "articleNumber": "DH.102.00-01",
        "name": "Aludeckel unten",
        "defaultQty": 1
      },
      {
        "pos": 4,
        "articleNumber": "DH.103.00-02",
        "name": "Aludeckel oben",
        "defaultQty": 1
      },
      {
        "pos": 5,
        "articleNumber": "DE.104.00",
        "name": "Elektr. Hubantrieb",
        "defaultQty": 1
      },
      {
        "pos": 6,
        "articleNumber": "DH.104.00",
        "name": "Hydr. Hubantrieb",
        "defaultQty": 1
      },
      {
        "pos": 7,
        "articleNumber": "Z-DH.104.04",
        "name": "Zahnriemenscheibe",
        "defaultQty": 1
      },
      {
        "pos": 8,
        "articleNumber": "Z-DH.104.05",
        "name": "Umlenkrolle",
        "defaultQty": 1
      },
      {
        "pos": 9,
        "articleNumber": "Z-DH.104.06",
        "name": "Zahnriemen",
        "defaultQty": 1
      },
      {
        "pos": 10,
        "articleNumber": "DH.105.00-01",
        "name": "Distanzscheibe",
        "defaultQty": 1
      },
      {
        "pos": 11,
        "articleNumber": "DH.106.00",
        "name": "Transportsicherung",
        "defaultQty": 1
      },
      {
        "pos": 12,
        "articleNumber": "DH.107.00",
        "name": "Sensor Abstandsflach",
        "defaultQty": 1
      },
      {
        "pos": 13,
        "articleNumber": "DE.109.00",
        "name": "Schaltschrank",
        "defaultQty": 1
      },
      {
        "pos": 14,
        "articleNumber": "Z-DH.109.01",
        "name": "Gehause",
        "defaultQty": 1
      },
      {
        "pos": 15,
        "articleNumber": "DH.111.00-01",
        "name": "Trichter",
        "defaultQty": 1
      },
      {
        "pos": 16,
        "articleNumber": "DH.114.00",
        "name": "Deckel Ventileinheit",
        "defaultQty": 1
      },
      {
        "pos": 17,
        "articleNumber": "DH.115.00",
        "name": "Steckdosendeckel",
        "defaultQty": 1
      },
      {
        "pos": 18,
        "articleNumber": "DH.116.00",
        "name": "Ventileinheit vormontiert",
        "defaultQty": 1
      },
      {
        "pos": 19,
        "articleNumber": "N6.110.05-01",
        "name": "Transportsicherung fix",
        "defaultQty": 1
      },
      {
        "pos": 20,
        "articleNumber": "Z-N6.301.00",
        "name": "Sensor",
        "defaultQty": 1
      },
      {
        "pos": 21,
        "articleNumber": "Z-00005",
        "name": "KFZ Steckdose 13P 12V",
        "defaultQty": 1
      },
      {
        "pos": 22,
        "articleNumber": "Z-00073",
        "name": "Sechskantmutter mit Klemmteile",
        "defaultQty": 1
      },
      {
        "pos": 23,
        "articleNumber": "Z-00092",
        "name": "Unterlegscheibe",
        "defaultQty": 1
      },
      {
        "pos": 24,
        "articleNumber": "Z-00099",
        "name": "Sechskantschraube mit Schaft",
        "defaultQty": 1
      },
      {
        "pos": 25,
        "articleNumber": "Z-00189",
        "name": "Not-Halt-Taster mit Kontakten",
        "defaultQty": 1
      },
      {
        "pos": 26,
        "articleNumber": "Z-00154",
        "name": "Sensorkabel M12 Rohling",
        "defaultQty": 4
      },
      {
        "pos": 27,
        "articleNumber": "Z-00215",
        "name": "Drucktaster weiss",
        "defaultQty": 1
      },
      {
        "pos": 28,
        "articleNumber": "Z-00232",
        "name": "2/2 Wegeventil",
        "defaultQty": 1
      },
      {
        "pos": 29,
        "articleNumber": "Z-00233",
        "name": "Druckminderventil",
        "defaultQty": 1
      }
    ]
  },
  {
    "id": "earth_container",
    "title": "Earth Container",
    "imageKey": "earth_container",
    "items": [
      {
        "pos": 1,
        "articleNumber": "DH.203.01-02",
        "name": "Welle",
        "defaultQty": 1
      },
      {
        "pos": 2,
        "articleNumber": "DH.203.04-01",
        "name": "Bohrer 18mm verschleissfest",
        "defaultQty": 1
      },
      {
        "pos": 3,
        "articleNumber": "DH.203.05-01",
        "name": "Bohrer 20mm verschleissfest",
        "defaultQty": 1
      },
      {
        "pos": 4,
        "articleNumber": "DH.203.06",
        "name": "Bohrer 22mm",
        "defaultQty": 1
      },
      {
        "pos": 5,
        "articleNumber": "DH.203.07",
        "name": "Bohrer 18mm",
        "defaultQty": 1
      },
      {
        "pos": 6,
        "articleNumber": "DH.203.08",
        "name": "Bohrer 20mm",
        "defaultQty": 1
      },
      {
        "pos": 7,
        "articleNumber": "DH.207.00-01",
        "name": "Federjoch",
        "defaultQty": 1
      },
      {
        "pos": 8,
        "articleNumber": "DH.215.00",
        "name": "Zugfedern",
        "defaultQty": 1
      },
      {
        "pos": 9,
        "articleNumber": "DH.216.01-03",
        "name": "Bodentopf",
        "defaultQty": 1
      },
      {
        "pos": 10,
        "articleNumber": "DH.216.09-02",
        "name": "Schublade",
        "defaultQty": 1
      },
      {
        "pos": 11,
        "articleNumber": "Z-DH.216.13",
        "name": "Spannhebel",
        "defaultQty": 1
      },
      {
        "pos": 12,
        "articleNumber": "DH.217.00",
        "name": "Fuhrungsstangen",
        "defaultQty": 1
      },
      {
        "pos": 13,
        "articleNumber": "DH.218.00-01",
        "name": "Stutzrohr",
        "defaultQty": 2
      },
      {
        "pos": 14,
        "articleNumber": "DH.220.01-01",
        "name": "Lagerschale",
        "defaultQty": 1
      },
      {
        "pos": 15,
        "articleNumber": "DH.220.02",
        "name": "Kunststoffeinsatz",
        "defaultQty": 1
      },
      {
        "pos": 16,
        "articleNumber": "DH.221.01",
        "name": "Tiefenbegrenzer",
        "defaultQty": 1
      }
    ]
  },
  {
    "id": "carriage",
    "title": "Carriage",
    "imageKey": "carriage",
    "items": [
      {
        "pos": 1,
        "articleNumber": "DH.200.00-02",
        "name": "Schlitten",
        "defaultQty": 1
      },
      {
        "pos": 2,
        "articleNumber": "DH.202.00",
        "name": "Lagerflansch",
        "defaultQty": 1
      },
      {
        "pos": 3,
        "articleNumber": "DE.203.02",
        "name": "Zwischenzapfen Elektromotor",
        "defaultQty": 1
      },
      {
        "pos": 4,
        "articleNumber": "DH.203.02",
        "name": "Zwischenzapfen Hydromotor",
        "defaultQty": 1
      },
      {
        "pos": 5,
        "articleNumber": "DH.203.03",
        "name": "Spannring",
        "defaultQty": 1
      },
      {
        "pos": 6,
        "articleNumber": "DH.204.00",
        "name": "Motorplatte",
        "defaultQty": 1
      },
      {
        "pos": 7,
        "articleNumber": "DH.205.00",
        "name": "Erdbehalterfuhrung",
        "defaultQty": 1
      },
      {
        "pos": 8,
        "articleNumber": "DH.206.01",
        "name": "Lagergehause",
        "defaultQty": 4
      },
      {
        "pos": 9,
        "articleNumber": "DH.208.00-01",
        "name": "Gewindewinkel",
        "defaultQty": 1
      },
      {
        "pos": 10,
        "articleNumber": "DH.209.00-01",
        "name": "Spannwinkel",
        "defaultQty": 1
      },
      {
        "pos": 11,
        "articleNumber": "Z-DE.210.00",
        "name": "Bohrmotor",
        "defaultQty": 1
      },
      {
        "pos": 12,
        "articleNumber": "DH.211.00",
        "name": "Klemmplatte",
        "defaultQty": 2
      },
      {
        "pos": 13,
        "articleNumber": "DH.213.00-01",
        "name": "Sensorhalter",
        "defaultQty": 1
      },
      {
        "pos": 14,
        "articleNumber": "DH.214.00",
        "name": "Distanzstuck Motor",
        "defaultQty": 4
      },
      {
        "pos": 15,
        "articleNumber": "Z-N6.210.00",
        "name": "Hydraulikmotor 32",
        "defaultQty": 1
      },
      {
        "pos": 16,
        "articleNumber": "Z-N6.211.01",
        "name": "Gleitfolie",
        "defaultQty": 4
      },
      {
        "pos": 17,
        "articleNumber": "Z-N6.301.00",
        "name": "Sensor",
        "defaultQty": 3
      },
      {
        "pos": 18,
        "articleNumber": "Z-00084",
        "name": "Unterlegscheibe",
        "defaultQty": 1
      },
      {
        "pos": 19,
        "articleNumber": "Z-00236",
        "name": "Sicherungsring aussen",
        "defaultQty": 1
      },
      {
        "pos": 20,
        "articleNumber": "Z-00237",
        "name": "Radialrillenkugellager Dia30mm",
        "defaultQty": 1
      },
      {
        "pos": 21,
        "articleNumber": "Z-00238",
        "name": "Zylinderschraube mit Innensechskant und Schaft",
        "defaultQty": 1
      }
    ]
  }
];
