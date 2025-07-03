import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#007bff',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', marginRight: '1rem' }}>
          TEC Analyzer
        </Link>
        {isLoggedIn && (
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
            Dashboard
          </Link>
        )}
      </div>
      <div>
        {!isLoggedIn && (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} style={{
            background: 'white',
            color: '#007bff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
