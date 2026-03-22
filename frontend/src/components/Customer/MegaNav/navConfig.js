export const NAV_ITEMS = [
  { id: 'home', label: 'Home', to: '/' },
  {
    id: 'music',
    label: 'Music',
    to: '/music',
    items: [
      { label: 'Albums', to: '/music/albums' },
      { label: 'EPs',    to: '/music/eps' },
    ],
  },
  {
    id: 'about',
    label: 'About',
    to: '/about',
    items: [
      { label: 'Our Story',        to: '/about' },
      { label: 'Mission & Values', to: '/about#mission' },
      { label: 'Tour Dates',       to: '/tour' },
      { label: 'Latest News',      to: '/news' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    to: '/media',
    items: [
      { label: 'Videos', to: '/media/videos' },
      { label: 'Pics',   to: '/media/pics' },
    ],
  },
];

export const STORE_TO = '/store';

export const STORE_DIRECT = [
  { label: 'New Arrivals', to: '/store?sortDir=desc' },
  { label: 'Sale',         to: '/#shop' },
];

export const STORE_SECTIONS = [
  {
    id: 'collections',
    label: 'Collections',
    items: [
      { label: 'The Spark Collection', to: '/store/collection/SPRK' },
      { label: 'Feed My Birds',        to: '/store/collection/BIRD' },
      { label: 'Sweater Weather',      to: '/store/collection/SWTR' },
      { label: 'H.Y.T.T.?',           to: '/store/collection/THNK' },
      { label: 'H.Y.P.E.',            to: '/store/collection/HYPE' },
      { label: 'Whelmed',             to: '/store/collection/WHLM' },
    ],
  },
  {
    id: 'music',
    label: 'Music',
    items: [
      { label: 'CDs',           to: '/store?productType=CD' },
      { label: 'Vinyl Records', to: '/store?productType=Vinyl' },
    ],
  },
  {
    id: 'apparel',
    label: 'Apparel',
    items: [
      { label: 'Tees',     to: '/store?productType=Tee' },
      { label: 'Sweaters', to: '/store?productType=Sweater' },
      { label: 'Hoodies',  to: '/store?productType=Hoodie' },
      { label: 'Beanies',  to: '/store?productType=Beanie' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    items: [
      { label: 'Mugs',     to: '/store?productType=Mug' },
      { label: 'Coasters', to: '/store?productType=Coaster' },
      { label: 'Blankets', to: '/store?productType=Blanket' },
      { label: 'Magnets',  to: '/store?productType=Magnet' },
      { label: 'Stickers', to: '/store?productType=Sticker' },
      { label: 'Posters',  to: '/store?productType=Poster' },
    ],
  },
];
