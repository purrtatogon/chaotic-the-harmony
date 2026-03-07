import { useMemo, useState, useLayoutEffect, useCallback, useId } from 'react';
import styles from '../../../styles/themes/customer.module.css';

const defaultColorKey = (v) =>
  [v.color, v.variantCode].find((x) => x != null && String(x).trim() !== '') ?? null;

function sortSizesList(sizes, sizeRank = []) {
  return [...sizes].sort((a, b) => {
    const ai = sizeRank.indexOf(a);
    const bi = sizeRank.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Button-style size / colour pickers aligned with PDP sizing / swatch styles. */
const VariantSelector = ({
  variants = [],
  onVariantChange,
  sizeRank = [],
  getColorKey = defaultColorKey,
  sizeLegend = 'Size',
  colorLegend = 'Colour',
}) => {
  const baseId = useId();

  const sortedSizes = useMemo(() => {
    const raw = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    return sortSizesList(raw, sizeRank);
  }, [variants, sizeRank]);

  const sortedColors = useMemo(() => {
    const raw = [...new Set(variants.map(getColorKey).filter(Boolean))];
    return [...raw]; /* stable uniq order */
  }, [variants, getColorKey]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const showSizeChooser = sortedSizes.length > 1;
  const showColorChooser = sortedColors.length > 1;

  const canonicalSize = useMemo(() => {
    if (sortedSizes.length === 0) return null;
    if (sortedSizes.length === 1) return sortedSizes[0];
    return selectedSize && sortedSizes.includes(selectedSize) ? selectedSize : null;
  }, [sortedSizes, selectedSize]);

  const canonicalColor = useMemo(() => {
    if (sortedColors.length === 0) return null;
    if (sortedColors.length === 1) return sortedColors[0];
    return selectedColor && sortedColors.includes(selectedColor) ? selectedColor : null;
  }, [sortedColors, selectedColor]);

  const match = useMemo(() => {
    if (variants.length === 0) return null;

    const sizeMatches = (v) => {
      if (sortedSizes.length === 0) return true;
      if (canonicalSize !== null) return (v.size ?? null) === canonicalSize;
      return false;
    };

    const colorMatches = (v) => {
      if (sortedColors.length === 0) return true;
      if (canonicalColor !== null) return getColorKey(v) === canonicalColor;
      return false;
    };

    return variants.find((v) => sizeMatches(v) && colorMatches(v)) ?? null;
  }, [
    variants,
    sortedSizes.length,
    sortedColors.length,
    canonicalSize,
    canonicalColor,
    getColorKey,
  ]);

  const notifyParent = useCallback(() => {
    const nextMatch = match ?? null;
    onVariantChange?.(nextMatch);
  }, [match, onVariantChange]);

  useLayoutEffect(() => {
    notifyParent();
  }, [notifyParent]);

  if (variants.length === 0) return null;

  return (
    <div className={styles.variantSelectorWrap}>
      {showSizeChooser && (
        <fieldset className={styles.pdpSizeFieldset}>
          <legend className={styles.pdpFieldsetLegend}>
            {sizeLegend}: {canonicalSize ? <strong>{canonicalSize}</strong> : 'Select'}
          </legend>
          <div className={styles.pdpSizeGrid} role="group">
            {sortedSizes.map((size) => {
              const active = canonicalSize === size;
              const btnId = `${baseId}-size-${size}`;
              return (
                <button
                  key={btnId}
                  id={btnId}
                  type="button"
                  className={`${styles.pdpSizeBtn} ${active ? styles.pdpSizeBtnActive : ''}`}
                  aria-pressed={active}
                  aria-label={`${sizeLegend} ${size}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {showColorChooser && (
        <fieldset className={styles.pdpVariantFieldset}>
          <legend className={styles.pdpFieldsetLegend}>
            {colorLegend}: {canonicalColor ? <strong>{canonicalColor}</strong> : 'Select'}
          </legend>
          <div className={styles.pdpVariantSwatches} role="group">
            {sortedColors.map((c) => {
              const active = canonicalColor === c;
              const btnId = `${baseId}-color-${c}`;
              return (
                <button
                  key={btnId}
                  id={btnId}
                  type="button"
                  className={`${styles.pdpVariantSwatch} ${active ? styles.pdpVariantSwatchActive : ''}`}
                  aria-pressed={active}
                  aria-label={`${colorLegend} ${c}`}
                  onClick={() => setSelectedColor(c)}
                >
                  <span className={styles.pdpSwatchLabel}>{c}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default VariantSelector;
