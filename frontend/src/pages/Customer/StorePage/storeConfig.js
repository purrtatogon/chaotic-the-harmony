// Store marketing copy and hand-picked product IDs. Names, prices, and images still come from the API.

export const HERO_SLIDES = [
  {
    id: 'collab-series',
    badge: 'New Drops',
    title: 'The Collaboration Series',
    subtitle: 'Exclusive drops from the latest era',
    ctaText: 'Shop Now',
    ctaLink: '/store?sortDir=desc',
    colorFrom: '#0062FF',
    featuredIds: [193, 186],
  },
  {
    id: 'whelmed-era',
    badge: '2025 Release',
    title: 'Right-Over-Left-Under-whelmed',
    subtitle: 'Embrace the chaos',
    ctaText: 'Shop Now',
    ctaLink: '/store?productType=STK',
    colorFrom: '#18D6BD',
    featuredIds: [192],
  },
  {
    id: 'sweater-weather',
    badge: 'Cozy Season',
    title: 'Cozy & Chaotic',
    subtitle: 'Apparel for the corporate burnout',
    ctaText: 'Shop Apparel',
    ctaLink: '/store?productType=HDD',
    colorFrom: '#C70E07',
    featuredIds: [],
  },
];

export const COLLECTION_META = {
  SPRK: {
    name: 'The Spark Collection',
    tagline: '2018 · The Debut Era',
    description:
      'Where it all started — post-corporate burnout, pre-everything else. Our debut album came from quitting the grind, and now you can wear the evidence.',
    colorFrom: '#0062FF',
    order: 1,
  },
  BIRD: {
    name: 'Feed My Birds',
    tagline: '2020 · Staying True',
    description:
      'Crows, snacks, and corvid conspiracy theories. An exploration of staying true to yourself when the world tells you otherwise.',
    colorFrom: '#1A7A00',
    order: 2,
  },
  SWTR: {
    name: 'Sweater Weather',
    tagline: '2021 · The World Changed',
    description:
      "The world changed overnight. Let's think about that. Also, we finally made the actual chunky knit we promised.",
    colorFrom: '#C70E07',
    order: 3,
  },
  THNK: {
    name: 'H.Y.T.T.?',
    tagline: '2023 · Have You Tried Thinking?',
    description:
      'The album was a HYTT (haha!). Our most conceptual era — immortalised in red-and-purple marbled vinyl and a black-on-black tee that asks the obvious question.',
    colorFrom: '#6B00C8',
    order: 4,
  },
  HYPE: {
    name: 'H.Y.P.E.',
    tagline: '2024 · Have You Practiced Enough?',
    description:
      'The EP. The one-year anniversary vinyl. The glitch beanie. The loading-bar hoodie. Operating at 99% capacity and proud of it.',
    colorFrom: '#007A6E',
    order: 5,
  },
  WHLM: {
    name: 'Whelmed',
    tagline: '2025 · Right-Over-Left-Under-whelmed',
    description:
      "Four vinyl colorways. Fourteen tracks. One existential question: don't you often feel... whelmed? Let's talk about that.",
    colorFrom: '#1A0F23',
    order: 6,
  },
};

export const PRODUCT_TYPE_LABELS = {
  CD:  'CDs',
  VYL: 'Vinyl',
  TEE: 'Tees',
  SWT: 'Sweaters',
  HDD: 'Hoodies',
  BNI: 'Beanies',
  BLN: 'Blankets',
  TOT: 'Totes',
  MUG: 'Mugs',
  COS: 'Coasters',
  MAG: 'Magnets',
  STK: 'Stickers',
  POS: 'Posters',
};

export const TYPE_GROUPS = [
  { label: 'Music',       codes: ['CD', 'VYL'] },
  { label: 'Apparel',     codes: ['TEE', 'SWT', 'HDD', 'BNI'] },
  { label: 'Accessories', codes: ['MUG', 'COS', 'MAG', 'STK', 'POS', 'BLN', 'TOT'] },
];

export const BROWSE_TYPE_META = [
  {
    id: 'music',
    name: 'Music',
    subtitle: 'Physical Media',
    description:
      'CDs and limited-edition vinyl from every era — debut to latest. Crispy highs, deep bass, and audiophile-grade anxiety.',
    link: '/store?productType=CD',
  },
  {
    id: 'apparel',
    name: 'Apparel',
    subtitle: 'Tees, Hoodies & Sweaters',
    description:
      'Organic cotton, heavyweight fleece, and one actual chunky knit we promised in 2021. All designed by us.',
    link: '/store?productType=TEE',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    subtitle: 'Mugs, Stickers & More',
    description:
      'Coasters with opinions, magnets with feelings, and posters with commitment issues. For your surfaces.',
    link: '/store?productType=MUG',
  },
];

export const SMALL_JOYS_IDS = [162, 110, 139, 109];

export const COLLAB_ITEMS = [
  { id: 181, edition: 'Limited Collab' },
  { id: 182, edition: "Collector's Edition" },
];
