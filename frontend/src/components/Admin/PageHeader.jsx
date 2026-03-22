import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const PageHeader = ({ title, subtitle, actions }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.dashboardHeader}>
      <div>
        <h1 className={styles.dashboardTitle}>{title}</h1>
        {subtitle && <p className={styles.dashboardSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
