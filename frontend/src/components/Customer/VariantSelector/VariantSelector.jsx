import { useState, useEffect } from 'react';
import styles from '../../../styles/themes/customer.module.css';

const VariantSelector = ({ variants = [], onVariantChange }) => {
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
  }, [variants]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (variants.length === 0) {
      onVariantChange(null);
      return;
    }

    const match = variants.find((v) => {
      const sizeOk = sizes.length === 0 || v.size === selectedSize;
      const colorOk = colors.length === 0 || v.color === selectedColor;
      return sizeOk && colorOk;
    });

    onVariantChange(match || null);
  }, [selectedSize, selectedColor, variants]); // eslint-disable-line react-hooks/exhaustive-deps

  if (variants.length === 0) return null;

  return (
    <div className={styles.container}>
      {sizes.length > 0 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Size</legend>
          <div className={styles.options} role="group">
            {sizes.map((size) => {
              const inputId = `size-${size}`;
              return (
                <label
                  key={size}
                  htmlFor={inputId}
                  className={`${styles.optionLabel} ${
                    selectedSize === size ? styles.optionLabelSelected : ''
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="variant-size"
                    value={size}
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                    className={styles.radioInput}
                  />
                  {size}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Color</legend>
          <div className={styles.options} role="group">
            {colors.map((color) => {
              const inputId = `color-${color}`;
              return (
                <label
                  key={color}
                  htmlFor={inputId}
                  className={`${styles.optionLabel} ${
                    selectedColor === color ? styles.optionLabelSelected : ''
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="variant-color"
                    value={color}
                    checked={selectedColor === color}
                    onChange={() => setSelectedColor(color)}
                    className={styles.radioInput}
                  />
                  {color}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default VariantSelector;
