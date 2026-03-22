import React, { useState, useRef, useLayoutEffect } from 'react';
import galleryStyles from './ProductImageGallery.module.css';

const ProductImageGallery = ({ images = [], onImagesChange, submitting }) => {
  const [editingAltText, setEditingAltText] = useState(null);
  const altEditorRef = useRef(null);

  useLayoutEffect(() => {
    if (editingAltText !== null && altEditorRef.current) {
      altEditorRef.current.focus();
    }
  }, [editingAltText]);

  const normalizedImages = images.map((img, idx) => {
    if (typeof img === 'string') {
      return { imageUrl: img, altText: '', id: idx };
    }
    return {
      imageUrl: img.imageUrl || img.url || '',
      altText: img.altText || '',
      id: img.id || idx,
    };
  });

  const removeImage = (indexToRemove) => {
    const updatedImages = normalizedImages.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };

  return (
    <div className={galleryStyles.wrap}>
      <span className={galleryStyles.sectionLabel} id="product-gallery-label">
        Product Gallery ({normalizedImages.length} images)
      </span>

      <div className={galleryStyles.grid} role="list" aria-labelledby="product-gallery-label">
        {normalizedImages.map((img, index) => (
          <div
            key={img.id || index}
            className={`${galleryStyles.tile} ${index === 0 ? galleryStyles.tileMain : ''}`.trim()}
            role="listitem"
          >
            <div className={galleryStyles.imageFrame}>
              <img
                src={img.imageUrl}
                alt={img.altText || `Product image ${index + 1}${index === 0 ? ' (primary)' : ''}`}
              />

              {index === 0 && (
                <span className={galleryStyles.mainBadge}>Primary</span>
              )}

              <button
                type="button"
                className={galleryStyles.removeButton}
                onClick={() => removeImage(index)}
                disabled={submitting}
                aria-label={`Remove image ${index + 1} from gallery`}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div className={galleryStyles.altPanel}>
              {editingAltText === index ? (
                <div>
                  <label htmlFor={`alt-text-${index}`} className={galleryStyles.altLabel}>
                    Alt text description
                  </label>
                  <textarea
                    ref={editingAltText === index ? altEditorRef : undefined}
                    id={`alt-text-${index}`}
                    className={galleryStyles.altTextarea}
                    value={img.altText || ''}
                    onChange={(e) => {
                      const updated = [...normalizedImages];
                      updated[index] = { ...updated[index], altText: e.target.value };
                      onImagesChange(updated);
                    }}
                    placeholder="Describe this image for people using screen readers"
                  />
                  <div className={galleryStyles.altActions}>
                    <button
                      type="button"
                      className={galleryStyles.doneButton}
                      onClick={() => setEditingAltText(null)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className={galleryStyles.altLabel}>Alt text</span>
                  <button
                    type="button"
                    className={`${galleryStyles.altTrigger} ${!img.altText ? galleryStyles.altTriggerMuted : ''}`.trim()}
                    onClick={() => setEditingAltText(index)}
                  >
                    <span>{img.altText || 'Add description for accessibility'}</span>
                    <span className={galleryStyles.editHint}>Edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className={galleryStyles.hint}>
        The first image is the primary display photo. Edit alt text so images are described in text, not by color alone.
      </p>
    </div>
  );
};

export default ProductImageGallery;
