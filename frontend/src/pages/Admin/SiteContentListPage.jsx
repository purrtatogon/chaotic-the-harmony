import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import { fetchSiteContent } from '../../api/siteContent';
import Table from '../../components/Global/Table';
import { canEditSiteContent } from '../../utils/userUtils';
import { findGroupBySlug } from '../../constants/cmsGroups';

const PREVIEW_MAX = 120;

function previewText(text) {
  if (text == null || text === '') return '—';
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= PREVIEW_MAX) return t;
  return `${t.slice(0, PREVIEW_MAX)}…`;
}

const SiteContentListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { groupSlug } = useParams();
  const canEdit = canEditSiteContent();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeGroup = groupSlug ? findGroupBySlug(groupSlug) : null;
  const allowedSections = useMemo(
    () => (activeGroup ? new Set(activeGroup.sections) : null),
    [activeGroup],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSiteContent();
        if (!cancelled) setBlocks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load site content');
          setBlocks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const bySection = useMemo(() => {
    const map = new Map();
    for (const b of blocks) {
      const s = b.section || 'UNKNOWN';
      if (allowedSections && !allowedSections.has(s)) continue;
      if (!map.has(s)) map.set(s, []);
      map.get(s).push(b);
    }
    for (const arr of map.values()) {
      arr.sort((a, c) => (a.key || '').localeCompare(c.key || ''));
    }
    return [...map.entries()].sort((a, c) => a[0].localeCompare(c[0]));
  }, [blocks, allowedSections]);

  const pageTitle = activeGroup ? activeGroup.label : 'Site content';
  const pageSubtitle = activeGroup
    ? `${activeGroup.sections.join(', ')} content blocks`
    : 'All CMS content blocks';

  if (loading) return <AdminLoading styles={styles} message="Loading site content…" />;
  if (error) {
    return (
      <Error message={error} onRetry={() => setReloadKey((k) => k + 1)} />
    );
  }

  return (
    <div className={styles.pageContent}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      <p className={styles.adminBrutalistNote}>
        {canEdit
          ? 'Super Admin and Store Manager can edit blocks below. Changes are saved to the database and persist across restarts once the table is populated.'
          : 'Read-only: ask a Super Admin or Store Manager to update copy. Data is served from the API (initial seed from CSV when the table was empty).'}
      </p>

      {bySection.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No content blocks found.</p>
        </div>
      ) : (
        bySection.map(([section, rows]) => (
          <ItemDetailCard key={section} title={section} fullWidth>
            <Table
              caption={`${section} — content keys`}
              columns={['Key', 'Title', 'Content preview']}
              data={rows}
              renderRow={(row) => [
                <td key="k">
                  <code className={styles.codeSnippet}>{row.key}</code>
                </td>,
                <td key="t">{row.title && row.title.trim() !== '' ? row.title : '—'}</td>,
                <td key="c">{previewText(row.content)}</td>,
              ]}
              actions={
                canEdit
                  ? (row) =>
                      row.id != null ? (
                        <Link
                          className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()}
                          to={`/admin/site-content/edit/${row.id}`}
                        >
                          Edit
                        </Link>
                      ) : null
                  : undefined
              }
            />
          </ItemDetailCard>
        ))
      )}
    </div>
  );
};

export default SiteContentListPage;
