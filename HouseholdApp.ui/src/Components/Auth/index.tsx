import React from 'react';
import { Link } from 'react-router-dom';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import AuthData from '../../data/authData';
import { useAuth } from '../../context/AuthContext';
import badge from '../../styles/images/Household_logo_badge.svg';

interface AuthProps {
  variant?: 'nav' | 'splash';
}

const Auth = ({ variant = 'nav' }: AuthProps) => {
  const { user } = useAuth();

  const handleLogout = () => {
    AuthData.logoutClickEvent();
  };

  if (!user) {
    if (variant === 'splash') {
      return (
        <button className="button" onClick={(e) => AuthData.loginClickEvent(e)}>
          <img src={badge} alt="Sign in to Household" />
        </button>
      );
    }
    return (
      <button className="btn btn-outline-light btn-sm" onClick={(e) => AuthData.loginClickEvent(e)}>
        Sign In
      </button>
    );
  }

  return (
    <>
      {(
        <div className='row'>
          <div className='user-icon-container'>
            <p>Hi {user.displayName}</p>
          </div>
          <UncontrolledDropdown>
            <DropdownToggle nav caret>
              {/* Dropdown content */}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                <Link to='/user-dashboard'>
                  <p>Dashboard</p>
                </Link>
              </DropdownItem>
              <DropdownItem>
                <button className='button' onClick={handleLogout}>
                  Logout
                </button>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      )}
    </>
  );
};

export default Auth;
