import React from 'react';
import ImageUpload from './ImageUpload';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';

const ProductImageGallery = ({ images = [], onImagesChange, submitting }) => {
  const theme = useTheme();

  const handleUploadSuccess = (url) => {
    // Add the new URL to the existing array
    const updatedImages = [...images, url];
    onImagesChange(updatedImages);
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
        Product Gallery ({images.length} images)
      </label>

      {/* THE GRID OF THUMBNAILS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem' 
      }}>
        {images.map((url, index) => (
          <div key={index} style={{ 
            position: 'relative', 
            aspectRatio: '1/1', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: `2px solid ${index === 0 ? '#fbbf24' : '#eee'}`, // Yellow border for Main Image
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={url} 
              alt={`Product ${index}`} 
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
        ))}

        {/* 2. THE UPLOAD BUTTON (Inside the grid) */}
        <div style={{ 
          aspectRatio: '1/1', 
          border: '2px dashed #ccc', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme === 'dark' ? '#222' : '#f9f9f9'
        }}>
          <ImageUpload 
            onUploadSuccess={handleUploadSuccess} 
            preset="bandstorecth_inventory_preset" 
          />
        </div>
      </div>
      
      <p style={{ fontSize: '0.8rem', color: '#666' }}>
        The first image will be used as the primary display photo.
      </p>
    </div>
  );
};

export default ProductImageGallery;