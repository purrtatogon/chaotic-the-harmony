import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const Button = ({ 
  children, 
  variant = 'default', 
  type = 'button', 
  onClick, 
  className = '', 
  ...props 
}) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  let buttonClass = styles.button;
  if (variant === 'primary') {
    buttonClass = `${styles.button} ${styles.buttonPrimary}`;
  } else if (variant === 'secondary') {
    buttonClass = `${styles.button} ${styles.buttonSecondary}`;
  }
  
  const classes = `${buttonClass} ${className}`.trim();

  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
