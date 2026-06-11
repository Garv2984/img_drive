import React from 'react';
import { HardDrive, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      {/* Brand Logo with dynamic gradient */}
      <div className="nav-brand">
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </svg>
        <HardDrive size={28} />
        <span>DobbyDrive</span>
      </div>

      {user && (
        <div className="nav-user">
          <div className="user-tag">
            Logged in as: <span>{user.username}</span>
          </div>
          <button onClick={onLogout} className="btn btn-secondary btn-danger">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
