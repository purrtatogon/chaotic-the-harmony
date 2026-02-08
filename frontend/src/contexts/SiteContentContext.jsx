import { createContext, useContext } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export const SiteContentContext = createContext(null);

/** Outside CustomerLayout `<SiteContentProvider>` this resolves to fetched state; inside it consumes the memoized provider. */
export const useSiteContentContext = () => {
  const ctx = useContext(SiteContentContext);
  const fetched = useSiteContent();
  return ctx ?? fetched;
};

export const SiteContentProvider = ({ children }) => {
  const value = useSiteContent();
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};
