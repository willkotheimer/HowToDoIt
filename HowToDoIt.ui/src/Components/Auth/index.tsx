import React from 'react';
import AuthData from '../../data/authData';
import { useAuth } from '../../context/AuthContext';

interface AuthProps {
  variant?: 'nav' | 'splash';
}

const Auth = ({ variant = 'nav' }: AuthProps) => {
  const { user } = useAuth();

  const handleLogout = () => AuthData.logoutClickEvent();

  if (!user) {
    const className = variant === 'splash' ? 'btn btn-primary btn-lg' : 'btn btn-outline-light btn-sm';
    return (
      <button type="button" className={className} onClick={(e) => AuthData.loginClickEvent(e)}>
        Sign In
      </button>
    );
  }

  return (
    <div className="auth-signed-in d-flex align-items-center">
      <span className="auth-hello mr-2">Hi {user.displayName || user.email}</span>
      <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default Auth;
