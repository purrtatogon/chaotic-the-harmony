import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { useSiteContentContext } from '../contexts/SiteContentContext';

/**
 * Renders FAQ section data as an accordion.
 * Uses Customer Theme when on customer routes.
 */
const FAQSection = ({ className = '' }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { blocksBySection, loading, error } = useSiteContentContext();
  const faqBlocks = blocksBySection('FAQ');
  const [openKey, setOpenKey] = useState(null);

  if (loading) {
    return (
      <div className={`loading-container ${className}`}>
        <div className="loading-spinner" />
        <p className="loading-message">Loading FAQ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 border-4 border-red-500 bg-red-50 text-red-800 ${className}`}>
        <p className="font-bold">Failed to load FAQ</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (faqBlocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {faqBlocks.map((block) => {
          const isOpen = openKey === block.key;
          return (
            <div
              key={block.key}
              className={`${styles.card} overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : block.key)}
                className="w-full text-left flex items-center justify-between gap-4 py-2 font-bold uppercase tracking-wide transition-colors hover:opacity-80"
                style={{ color: 'var(--main-100)' }}
              >
                <span>{block.title}</span>
                <span
                  className="text-2xl leading-none transition-transform"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div
                  className="pt-2 pb-2 border-t-4 mt-2"
                  style={{
                    borderColor: 'var(--gray-100)',
                    color: 'var(--gray-100)',
                  }}
                >
                  <p className="leading-relaxed">{block.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
