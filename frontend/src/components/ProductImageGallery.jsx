import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';
import Input from './Input';

const ProductImageGallery = ({ images = [], onImagesChange, submitting }) => {
  const theme = useTheme();
  const [editingAltText, setEditingAltText] = useState(null);

  // Normalize images: handle both string URLs and image objects
  const normalizedImages = images.map((img, idx) => {
    if (typeof img === 'string') {
      return { imageUrl: img, altText: '', id: idx };
    }
    return { 
      imageUrl: img.imageUrl || img.url || '', 
      altText: img.altText || '', 
      id: img.id || idx 
    };
  });

  const removeImage = (indexToRemove) => {
    const updatedImages = normalizedImages.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };

  const updateAltText = (index, newAltText) => {
    const updatedImages = [...normalizedImages];
    updatedImages[index] = { ...updatedImages[index], altText: newAltText };
    onImagesChange(updatedImages);
    setEditingAltText(null);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
        Product Gallery ({normalizedImages.length} images)
      </label>

      {/* THE GRID OF THUMBNAILS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem' 
      }}>
        {normalizedImages.map((img, index) => (
          <div key={img.id || index} style={{ 
            position: 'relative',
            borderRadius: '8px', 
            overflow: 'hidden',
            border: `2px solid ${index === 0 ? '#fbbf24' : '#eee'}`, // Yellow border for Main Image
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: '#fff'
          }}>
            <div style={{ 
              position: 'relative', 
              aspectRatio: '1/1', 
              overflow: 'hidden'
            }}>
              <img 
                src={img.imageUrl} 
                alt={img.altText || `Product ${index + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              {/* Index 0 Label */}
              {index === 0 && (
                <span style={{
                  position: 'absolute', top: 0, left: 0, background: '#fbbf24',
                  color: '#000', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold'
                }}>MAIN</span>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute', top: '5px', right: '5px',
                  background: 'rgba(255, 0, 0, 0.7)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                  cursor: 'pointer', fontSize: '12px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center'
                }}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {/* Alt Text Section */}
            <div style={{ padding: '8px', background: '#f9f9f9' }}>
              {editingAltText === index ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold', 
                    color: '#333',
                    marginBottom: '2px'
                  }}>
                    Alt Text Description:
                  </label>
                  <textarea
                    value={img.altText || ''}
                    onChange={(e) => {
                      const updated = [...normalizedImages];
                      updated[index] = { ...updated[index], altText: e.target.value };
                      onImagesChange(updated);
                    }}
                    placeholder="Enter alt text description for this image..."
                    style={{
                      fontSize: '0.75rem',
                      padding: '6px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%',
                      minHeight: '60px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditingAltText(null)}
                      style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold', 
                    color: '#333',
                    marginBottom: '2px'
                  }}>
                    Alt Text:
                  </div>
                  <div 
                    onClick={() => setEditingAltText(index)}
                    style={{
                      fontSize: '0.75rem',
                      color: img.altText ? '#333' : '#999',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '4px',
                      minHeight: '40px',
                      background: img.altText ? '#fff' : '#f5f5f5',
                      border: `1px solid ${img.altText ? '#ddd' : '#e0e0e0'}`,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      display: 'flex',
                      alignItems: 'flex-start',
                      position: 'relative'
                    }}
                    title="Click to edit alt text"
                  >
                    <span style={{ flex: 1 }}>
                      {img.altText || 'Click to add alt text description'}
                    </span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      marginLeft: '4px',
                      color: '#666',
                      flexShrink: 0
                    }}>
                      ✏️
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p style={{ fontSize: '0.8rem', color: '#666' }}>
        The first image will be used as the primary display photo. Click on alt text to edit it.
      </p>
    </div>
  );
};

export default ProductImageGallery;