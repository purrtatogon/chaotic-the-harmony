import { useId } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const Input = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  rows,
  children, // for select options
  ...props 
}) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const generatedId = useId();
  const inputId = id || generatedId;
  
  const inputClasses = `${styles.input} ${className}`.trim();

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          className={inputClasses}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows || 4}
          {...props}
        />
      );
    }
    
    if (type === 'select') {
      return (
        <select
          id={inputId}
          className={inputClasses}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    );
  };

  if (label) {
    const groupClass = theme === 'admin' ? styles.formGroup : 'form-group';
    const labelClass = theme === 'admin' ? styles.formGroupLabel : undefined;
    return (
      <div className={groupClass}>
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
        {renderInput()}
      </div>
    );
  }

  return renderInput();
};

export default Input;
