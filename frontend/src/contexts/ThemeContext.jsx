import { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext('admin');

export const useTheme = () => useContext(ThemeContext);

/** Drives `[data-theme]` on `<html>` for CSS Modules + token overrides (customer purple vs admin pink). */
export const ThemeProvider = ({ theme = 'admin', children }) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
