import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Cloudinary requires FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_preset_name'); // Replace with your Cloudinary preset

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', // Replace your_cloud_name
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
      {uploading && <span>Uploading to Cloudinary...</span>}
    </div>
  );
};

export default ImageUpload;