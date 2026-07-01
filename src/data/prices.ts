export type PriceMode = 'fixed' | 'from' | 'request';

export interface PriceEntry {
  amount: number | null;
  mode: PriceMode;
}

export const priceCatalog = {
  mp1: { amount: 14626, mode: 'from' },
  mp2: { amount: 16995, mode: 'from' },
  mp3: { amount: 24205, mode: 'from' },
  mp4: { amount: 26265, mode: 'from' },
  dh: { amount: 8950, mode: 'from' },
  de: { amount: 12600, mode: 'from' },
  boprob: { amount: 29355, mode: 'from' },
  laydown: { amount: 2873.7, mode: 'from' },
  tph: { amount: 1699.5, mode: 'from' },
  fc: { amount: 14821.7, mode: 'from' },
  trailer: { amount: 5499, mode: 'from' },
  powerpack: { amount: 1998, mode: 'from' },
  spareparts: { amount: 25.24, mode: 'from' },
  coolbox: { amount: 1030, mode: 'fixed' },
  led: { amount: 69.01, mode: 'fixed' },
  camera: { amount: 231.75, mode: 'fixed' },
  probes: { amount: 173.56, mode: 'from' },
  drillrods: { amount: 140.39, mode: 'from' },
  hammers: { amount: 123.6, mode: 'from' },
  goettingerDrills: { amount: 183.13, mode: 'from' },
  raupe: { amount: 20000, mode: 'from' },
} as const satisfies Record<string, PriceEntry>;

export type PriceKey = keyof typeof priceCatalog;

const localeByLanguage: Record<string, string> = {
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  ro: 'ro-RO',
  pt: 'pt-PT',
  ru: 'ru-RU',
};

const normalizeLanguage = (language: string) => {
  const baseLanguage = language.toLowerCase().split('-')[0];
  return localeByLanguage[baseLanguage] || localeByLanguage.en;
};

export const formatEuroAmount = (amount: number, language: string) => {
  return new Intl.NumberFormat(normalizeLanguage(language), {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPriceValue = (priceKey: PriceKey) => {
  return priceCatalog[priceKey].amount;
};

export const getPriceDisplay = (
  priceKey: PriceKey,
  language: string,
  t: (key: string) => string
) => {
  const priceEntry = priceCatalog[priceKey];

  if (priceEntry.mode === 'request' || priceEntry.amount === null) {
    return t('pricing.onRequest');
  }

  const formattedAmount = formatEuroAmount(priceEntry.amount, language);
  return priceEntry.mode === 'from'
    ? `${t('pricing.from')} ${formattedAmount}`
    : formattedAmount;
};

export const getLowestPriceDisplay = (
  priceKeys: PriceKey[],
  language: string,
  t: (key: string) => string
) => {
  const amounts = priceKeys
    .map((priceKey) => getPriceValue(priceKey))
    .filter((value): value is number => typeof value === 'number');

  if (!amounts.length) {
    return t('pricing.onRequest');
  }

  return `${t('pricing.from')} ${formatEuroAmount(Math.min(...amounts), language)}`;
};
