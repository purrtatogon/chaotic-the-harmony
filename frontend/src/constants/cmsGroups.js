export const CMS_GROUPS = [
  { slug: 'global', label: 'Global', sections: ['GLOBAL'] },
  { slug: 'navs-stubs', label: 'Navs & Stubs', sections: ['NAV', 'MEGANAV', 'STUB'] },
  { slug: 'home', label: 'Home', sections: ['HOME'] },
  { slug: 'about', label: 'About', sections: ['ABOUT'] },
  { slug: 'music', label: 'Music', sections: ['MUSIC'] },
  { slug: 'media', label: 'Media', sections: ['MEDIA'] },
  { slug: 'store-ui', label: 'Store & UI', sections: ['STORE', 'STORE_UI'] },
  { slug: 'shipping', label: 'Shipping', sections: ['SHIPPING'] },
  { slug: 'inclusivity', label: 'Inclusivity', sections: ['INCLUSIVITY'] },
  { slug: 'sustainability', label: 'Sustainability', sections: ['SUSTAINABILITY'] },
  { slug: 'faq', label: 'FAQ', sections: ['FAQ'] },
  { slug: 'careers', label: 'Careers', sections: ['CAREERS'] },
];

export function findGroupBySlug(slug) {
  return CMS_GROUPS.find((g) => g.slug === slug) || null;
}

export function findGroupBySection(section) {
  return CMS_GROUPS.find((g) => g.sections.includes(section)) || null;
}
