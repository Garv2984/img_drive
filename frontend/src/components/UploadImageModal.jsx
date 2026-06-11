import React, { useState, useRef } from 'react';
import { X, UploadCloud, ImageIcon } from 'lucide-react';

const UploadImageModal = ({ isOpen, onClose, onUpload }) => {
  const [imageName, setImageName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, GIF, WEBP) are allowed');
      return;
    }

    setSelectedFile(file);
    setError('');

    // If imageName is empty, prefill it with the filename (without extension)
    if (!imageName.trim()) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setImageName(nameWithoutExt);
    }

    // Set preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onFileSelectChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageName.trim()) {
      setError('Please provide a name for the image');
      return;
    }

    if (!selectedFile) {
      setError('Please select an image file to upload');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(imageName.trim(), selectedFile);
      
      // Reset state on success
      setImageName('');
      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImageName('');
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} className="folder-icon" style={{ color: 'var(--color-accent)' }} />
            Upload Image
          </h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label htmlFor="image-name-input">Image Name</label>
              <input
                id="image-name-input"
                type="text"
                className="form-control"
                placeholder="Enter image display name..."
                value={imageName}
                onChange={(e) => {
                  setImageName(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            <div className="form-group">
              <label>Select Image File</label>
              
              <input
                type="file"
                ref={fileInputRef}
                className="file-upload-input"
                accept="image/*"
                onChange={onFileSelectChange}
              />

              {!previewUrl ? (
                <div
                  className={`file-upload-zone ${dragActive ? 'dragover' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <UploadCloud size={36} style={{ color: 'var(--color-text-muted)' }} />
                  <p>
                    Drag and drop your image here, or <span>browse</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    Supports PNG, JPG, GIF, WEBP up to 10MB
                  </p>
                </div>
              ) : (
                <div className="file-upload-zone" onClick={triggerFileInput} style={{ padding: '1rem' }}>
                  <img src={previewUrl} alt="Selected preview" className="file-upload-preview" />
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                    Click to change: {selectedFile?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;
