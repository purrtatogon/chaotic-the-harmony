import React, { createContext, useContext } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export const SiteContentContext = createContext(null);

/**
 * Use site content - prefers context from SiteContentProvider (single fetch),
 * falls back to direct fetch if used outside provider.
 */
export const useSiteContentContext = () => {
  const ctx = useContext(SiteContentContext);
  const fetched = useSiteContent();
  return ctx ?? fetched;
};

/**
 * Provides site content to all descendants. Fetches CSV once.
 */
export const SiteContentProvider = ({ children }) => {
  const value = useSiteContent();
  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
};
