import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const ItemDetailField = ({ label, value, children }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div style={{ marginBottom: '24px' }}>
      <span className={styles.itemDetailLabel}>{label}</span>
      <div className={styles.itemDetailValue}>{children || value}</div>
    </div>
  );
};

export default ItemDetailField;
