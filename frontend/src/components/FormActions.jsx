import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const FormActions = ({ children }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.formActions}>
      {children}
    </div>
  );
};

export default FormActions;
