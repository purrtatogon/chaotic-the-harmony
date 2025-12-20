import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Card from '../Global/Card';

const ItemDetailCard = ({ title, actions, children, className = '', fullWidth = false }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  const classes = `${styles.itemDetailCard} ${fullWidth ? styles.itemDetailCardFullWidth : ''} ${className}`.trim();

  return (
    <Card className={classes}>
      {(title || actions) && (
        <div className={styles.itemDetailHeader}>
          {title && <h2 className={styles.itemDetailTitle}>{title}</h2>}
          {actions && <div className={styles.itemDetailActions}>{actions}</div>}
        </div>
      )}
      {children}
    </Card>
  );
};

export default ItemDetailCard;
