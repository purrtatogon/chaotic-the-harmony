import { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext('admin');

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ theme = 'admin', children }) => {
  // Set theme immediately (synchronously) before render
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Use useLayoutEffect to update theme when it changes
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Cleanup: remove attribute when component unmounts or theme changes
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-theme');
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;


