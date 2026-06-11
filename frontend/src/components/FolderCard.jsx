import React from 'react';
import { Folder } from 'lucide-react';

const FolderCard = ({ folder, onClick }) => {
  // Formats bytes into a human-readable size string
  const formatSize = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="folder-card glass-panel" onClick={() => onClick(folder._id)}>
      <div className="folder-icon">
        <Folder size={36} fill="#f59e0b" stroke="#d97706" />
      </div>
      <div className="folder-details">
        <span className="folder-name" title={folder.name}>
          {folder.name}
        </span>
        <span className="folder-size">{formatSize(folder.size)}</span>
      </div>
    </div>
  );
};

export default FolderCard;
