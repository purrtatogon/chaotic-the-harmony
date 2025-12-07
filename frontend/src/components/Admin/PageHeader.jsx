import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const PageHeader = ({ title, subtitle, actions, sticky = false, subtitleClassName = '', className = '' }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  const headerClass = [styles.dashboardHeader, sticky && styles.pageHeaderSticky, className]
    .filter(Boolean)
    .join(' ');

  const subtitleClass = [styles.dashboardSubtitle, subtitleClassName].filter(Boolean).join(' ');

  return (
    <div className={headerClass}>
      <div>
        <h1 className={styles.dashboardTitle}>{title}</h1>
        {subtitle && <p className={subtitleClass}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
