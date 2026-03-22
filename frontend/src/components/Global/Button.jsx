import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const Button = ({
  children,
  variant = 'default',
  type = 'button',
  onClick,
  className = '',
  size,
  ...props
}) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  let buttonClass = styles.button;
  if (variant === 'primary') {
    buttonClass = `${styles.button} ${styles.buttonPrimary}`;
  } else if (variant === 'secondary') {
    buttonClass = `${styles.button} ${styles.buttonSecondary}`;
  } else if (variant === 'danger' && styles.buttonDanger) {
    buttonClass = `${styles.button} ${styles.buttonDanger}`;
  }

  const sizeClass = size === 'small' && styles.buttonSmall ? styles.buttonSmall : '';

  const classes = `${buttonClass} ${sizeClass} ${className}`.trim();

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
