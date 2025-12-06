import adminStyles from '../styles/themes/admin.module.css';
import customerStyles from '../styles/themes/customer.module.css';

export const getThemeStyles = (theme) => {
  return theme === 'admin' ? adminStyles : customerStyles;
};

