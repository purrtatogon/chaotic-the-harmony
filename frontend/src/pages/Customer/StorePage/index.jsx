import { useSearchParams } from 'react-router-dom';
import StoreHeroCarousel from './StoreHeroCarousel';
import CollectionGrid    from './CollectionGrid';
import BrowseByType      from './BrowseByType';
import BrowseSection     from './BrowseSection';
import SmallJoys         from './SmallJoys';
import CollabGallery     from './CollabGallery';


const StorePage = () => {
  const [searchParams] = useSearchParams();

  const productType = searchParams.get('productType') || null;
  const sortDir     = searchParams.get('sortDir')     || null;

  /* A filter is active when either productType or an explicit sort is set */
  const isFiltered = Boolean(productType || sortDir);

  if (isFiltered) {
    /* ── Focused browse view ─────────────────────────────────────────
     * The user arrived here from a "Browse by Type" card or a nav sub-menu.
     * Show only what's relevant: the filtered grid + the budget picks.
     * BrowseSection reads productType/sortDir from the URL itself.
     */
    return (
      <div >
        <h1 className="srOnly">
          Store — {productType ? productType : 'New Arrivals'} — Chaotic the Harmony
        </h1>
        <BrowseSection />
        <SmallJoys />
      </div>
    );
  }

  /* ── Editorial store home ────────────────────────────────────────── */
  return (
    <div >
      {/* Visually hidden page title — one <h1> per page (WCAG 1.3.1 AAA) */}
      <h1 className="srOnly">Store — Chaotic the Harmony</h1>

      <StoreHeroCarousel />
      <CollectionGrid />
      <BrowseByType />
      <SmallJoys />
      <CollabGallery />
    </div>
  );
};

export default StorePage;
