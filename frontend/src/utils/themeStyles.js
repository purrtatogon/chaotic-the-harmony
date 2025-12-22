import adminStyles from '../styles/themes/admin.module.css';
import clientStyles from '../styles/themes/client.module.css';

export const getThemeStyles = (theme) => {
  return theme === 'admin' ? adminStyles : clientStyles;
};

