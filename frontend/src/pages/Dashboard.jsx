import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FolderPlus, Upload, Search, HardDrive, AlertCircle, X, ChevronRight, CornerDownRight } from 'lucide-react';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';

const Dashboard = () => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch folders and files in current folder
  const fetchContents = useCallback(async (folderId) => {
    try {
      setLoading(true);
      setError('');
      
      const parentQuery = folderId ? `?parent=${folderId}` : '';
      const res = await fetch(`http://localhost:5000/api/folders/contents${parentQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch folder contents');
      }

      setFolders(data.folders || []);
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading files');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch all user folders to build breadcrumbs and hierarchy
  const fetchAllFolders = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/folders/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllFolders(data || []);
      }
    } catch (err) {
      console.error('Error fetching all folders:', err);
    }
  }, [token]);

  // Load initial dashboard contents
  useEffect(() => {
    if (token) {
      fetchContents(currentFolderId);
      fetchAllFolders();
    }
  }, [currentFolderId, token, fetchContents, fetchAllFolders]);

  const handleCreateFolder = async (folderName) => {
    try {
      setError('');
      const res = await fetch('http://localhost:5000/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: folderName,
          parent: currentFolderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create folder');
      }

      // Close modal
      setIsCreateFolderOpen(false);
      
      // Refresh current folder and all folders list
      fetchContents(currentFolderId);
      fetchAllFolders();
    } catch (err) {
      setError(err.message || 'Error creating folder');
    }
  };

  const handleUploadImage = async (name, file) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', file);
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }

    const res = await fetch('http://localhost:5000/api/images/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    // Refresh contents
    fetchContents(currentFolderId);
  };

  // Filter folders and images based on search query
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="dashboard-container">
      {/* Top Action Bar */}
      <div className="dashboard-actions">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search folders and images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => setIsCreateFolderOpen(true)}>
            <FolderPlus size={18} />
            <span>New Folder</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsUploadImageOpen(true)}>
            <Upload size={18} />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        currentFolderId={currentFolderId}
        folders={allFolders}
        onNavigate={setCurrentFolderId}
      />

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center' }}>
          <AlertCircle size={18} style={{ marginRight: '6px' }} />
          {error}
        </div>
      )}

      {/* Main Contents */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="content-area">
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <div>
              <h2 className="section-title">
                <ChevronRight size={16} />
                Folders ({filteredFolders.length})
              </h2>
              <div className="folders-grid">
                {filteredFolders.map((folder) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    onClick={setCurrentFolderId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Images Section */}
          {filteredImages.length > 0 && (
            <div>
              <h2 className="section-title">
                <ChevronRight size={16} />
                Images ({filteredImages.length})
              </h2>
              <div className="images-grid">
                {filteredImages.map((image) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    onClick={setZoomedImage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredImages.length === 0 && (
            <div className="empty-state glass-panel">
              <HardDrive size={64} className="empty-state-icon" />
              {searchQuery ? (
                <>
                  <h3>No search results found</h3>
                  <p>Try modifying your search keywords or clear the search query.</p>
                </>
              ) : (
                <>
                  <h3>This folder is empty</h3>
                  <p>Click "New Folder" to create a directory or "Upload Image" to add files.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialogs */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <UploadImageModal
        isOpen={isUploadImageOpen}
        onClose={() => setIsUploadImageOpen(false)}
        onUpload={handleUploadImage}
      />

      {/* Zoom Preview Overlay */}
      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => setZoomedImage(null)}>
          <button className="zoom-close" onClick={() => setZoomedImage(null)}>
            <X size={20} />
          </button>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:5000${zoomedImage.path}`}
              alt={zoomedImage.name}
            />
          </div>
          <div className="zoom-header">
            <h4>{zoomedImage.name}</h4>
            <span>Size: {formatSize(zoomedImage.size)} • Uploaded: {new Date(zoomedImage.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
