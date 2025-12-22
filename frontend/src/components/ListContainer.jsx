import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const ListContainer = ({ title, count, children, actions }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <h2 className={styles.listHeaderTitle}>
          {title}
          {count !== undefined && ` (${count})`}
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      <div className={styles.listContent}>
        {children}
      </div>
    </div>
  );
};

export default ListContainer;
