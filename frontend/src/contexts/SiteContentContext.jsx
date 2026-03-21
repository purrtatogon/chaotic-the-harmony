import React, { createContext, useContext } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export const SiteContentContext = createContext(null);

export const useSiteContentContext = () => {
  const ctx = useContext(SiteContentContext);
  const fetched = useSiteContent();
  return ctx ?? fetched;
};

export const SiteContentProvider = ({ children }) => {
  const value = useSiteContent();
  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
};
