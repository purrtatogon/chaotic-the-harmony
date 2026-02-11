import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { useSiteContentContext } from '../contexts/SiteContentContext';

/**
 * Renders all content blocks belonging to the given section.
 * Uses Customer Theme when on customer routes.
 */
const ContentSection = ({ section, className = '' }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { blocksBySection, loading, error } = useSiteContentContext();
  const blocks = blocksBySection(section);

  if (loading) {
    return (
      <div className={`loading-container ${className}`}>
        <div className="loading-spinner" />
        <p className="loading-message">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 border-4 border-red-500 bg-red-50 text-red-800 ${className}`}>
        <p className="font-bold">Failed to load content</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block) => (
        <article
          key={block.key}
          className={`${styles.card} mb-6 last:mb-0`}
        >
          <h2 className="text-xl font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--main-100)' }}>
            {block.title}
          </h2>
          <p className="leading-relaxed" style={{ color: 'var(--gray-100)' }}>
            {block.content}
          </p>
        </article>
      ))}
    </div>
  );
};

export default ContentSection;
