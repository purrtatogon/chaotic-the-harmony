import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const Form = ({ children, onSubmit, className = '' }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${className}`.trim()}>
      {children}
    </form>
  );
};

export default Form;
