import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const Card = ({ children, className = '', fullWidth = false, ...props }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const classes = `${styles.card} ${fullWidth ? 'full-width' : ''} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
