import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const FormRow = ({ children }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.formRow}>
      {children}
    </div>
  );
};

export default FormRow;
