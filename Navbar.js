import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserEdit, faUser, faUsers, faSignOutAlt, faChartBar, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css'; // Make sure to create and import this CSS file

const Navbar = ({ username, userRole, setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      setUserRole(null);
      navigate('/login');
    }
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <img src="/images/logogo.png" alt="Logo" className="sidebar-logo" />
          
          {username && (
  <span className="sidebar-user-role" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
    {username.charAt(0).toUpperCase() + username.slice(1)}
  </span>
)}

          <p style={{color:'white'}}>__________________________</p>
        </div>
        
        <nav className="sidebar-nav">
          
          {location.pathname !== '/login' && (
            <Link to="/home" className="sidebar-link">
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>
          )}

          {userRole && (
            <Link to="/dashboard" className="sidebar-link">
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span>Dashboard</span>
            </Link>
          )}

          {userRole === 'admin' && (
            <>
              <Link to="/admin" className="sidebar-link">
                <FontAwesomeIcon icon={faUserEdit} />
                <span>Resident Profile</span>
              </Link>
            </>
          )}
          {userRole === 'editor' && (
            <Link to="/editor" className="sidebar-link">
              <FontAwesomeIcon icon={faUserEdit} />
              <span>Resident Profile</span>
            </Link>
          )}
          {userRole === 'viewer' && (
            <Link to="/viewer" className="sidebar-link">
              <FontAwesomeIcon icon={faUser} />
              <span>Resident Profile</span>
            </Link>
          )}
          {userRole && (
            <Link to="/analytics" className="sidebar-link">
              <FontAwesomeIcon icon={faChartBar} />
              <span>Analytics</span>
            </Link>
          )}
          
          {userRole && (
            <button onClick={handleLogout} className="sidebar-link sidebar-logout">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;