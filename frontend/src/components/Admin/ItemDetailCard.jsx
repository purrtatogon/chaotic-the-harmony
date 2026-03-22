import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Card from '../Global/Card';

const ItemDetailCard = ({ title, children, className = '', fullWidth = false }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  const classes = `${styles.itemDetailCard} ${fullWidth ? styles.itemDetailCardFullWidth : ''} ${className}`.trim();

  return (
    <Card className={classes}>
      {title && (
        <div className={styles.itemDetailHeader}>
          <h2 className={styles.itemDetailTitle}>{title}</h2>
        </div>
      )}
      {children}
    </Card>
  );
};

export default ItemDetailCard;
