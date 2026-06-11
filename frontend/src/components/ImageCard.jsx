import React from 'react';
import { Image as ImageIcon, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ImageCard = ({ image, onClick }) => {

  const formatSize = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const imageUrl = image.path.startsWith('http') ? image.path : `${API_BASE_URL}${image.path}`;

  return (
    <div className="image-card glass-panel" onClick={() => onClick(image)}>
      <div className="image-preview">
        <img
          src={imageUrl}
          alt={image.name}
          onError={(e) => {
            // Fallback in case of image load error
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
          }}
        />
      </div>
      <div className="image-details">
        <span className="image-name" title={image.name}>
          {image.name}
        </span>
        <div className="image-meta">
          <span>{formatSize(image.size)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={12} />
            {formatDate(image.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
