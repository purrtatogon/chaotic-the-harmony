import { useState, useEffect, useCallback, useContext } from 'react';
import type { SiteContentBlock } from '../types/siteContent';
import { fetchSiteContent } from '../api/siteContent';
import { SiteContentContext } from '../contexts/SiteContentContext';

interface UseSiteContentResult {
  blocks: SiteContentBlock[];
  blocksBySection: (section: string) => SiteContentBlock[];
  loading: boolean;
  error: string | null;
}

/** Site CMS blocks from the API; uses provider data when wrapped. */
export function useSiteContent(): UseSiteContentResult {
  const ctx = useContext(SiteContentContext);
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [loading, setLoading] = useState(!ctx);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ctx) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSiteContent();
        if (cancelled) return;
        setBlocks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load site content');
          setBlocks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [ctx]);

  const blocksBySection = useCallback(
    (section: string) => blocks.filter((b) => b.section.toUpperCase() === section.toUpperCase()),
    [blocks]
  );

  if (ctx) return ctx;
  return { blocks, blocksBySection, loading, error };
}
