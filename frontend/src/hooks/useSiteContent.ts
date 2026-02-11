import { useState, useEffect, useCallback, useContext } from 'react';
import type { SiteContentBlock } from '../types/siteContent';
import { parseSiteContent } from '../utils/parseSiteContent';
import { SiteContentContext } from '../contexts/SiteContentContext';

const CSV_URL = '/data/site_content.csv';

interface UseSiteContentResult {
  blocks: SiteContentBlock[];
  blocksBySection: (section: string) => SiteContentBlock[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and parses site content from CSV.
 * Uses context when inside SiteContentProvider (single fetch), otherwise fetches directly.
 */
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
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        setBlocks(parseSiteContent(text));
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
