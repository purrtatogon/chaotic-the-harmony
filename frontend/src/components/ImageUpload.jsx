import React, { useState } from 'react';
import axios from 'axios';

// a 'preset' prop with a default value
const ImageUpload = ({ onUploadSuccess, preset = 'bandstorecth_user_preset' }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Cloudinary requires FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // dynamic preset passed from the parent component
    formData.append('upload_preset', preset); 

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dlqadfo7q/image/upload', 
        formData
      );
      
      // Send the URL back to the parent form
      onUploadSuccess(res.data.secure_url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span style={{ marginLeft: '10px', color: '#666' }}>Uploading...</span>}
    </div>
  );
};

export default ImageUpload;