import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';

const Breadcrumbs = ({ currentFolderId, folders, onNavigate }) => {
  // Construct the hierarchy path
  const getPath = () => {
    const path = [];
    if (!currentFolderId) return path;

    let current = folders.find((f) => f._id === currentFolderId);
    while (current) {
      path.unshift(current);
      current = folders.find((f) => f._id === current.parent);
    }
    return path;
  };

  const path = getPath();

  return (
    <div className="breadcrumbs-bar glass-panel">
      <div className="breadcrumbs">
        {/* Root/Home breadcrumb */}
        <span
          className={`breadcrumb-item ${path.length === 0 ? 'active' : ''}`}
          onClick={() => path.length > 0 && onNavigate(null)}
        >
          <Home size={16} />
          <span>My Drive</span>
        </span>

        {path.map((folder, index) => {
          const isLast = index === path.length - 1;
          return (
            <React.Fragment key={folder._id}>
              <span className="breadcrumb-separator">
                <ChevronRight size={14} />
              </span>
              <span
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                onClick={() => !isLast && onNavigate(folder._id)}
              >
                <Folder size={16} />
                <span>{folder.name}</span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Breadcrumbs;
