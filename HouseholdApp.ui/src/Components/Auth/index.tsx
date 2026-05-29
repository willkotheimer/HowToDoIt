import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'firebase/auth';
import { Link } from 'react-router-dom';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import AuthData from '../../helpers/data/authData';
import Logo from '../../styles/images/Household_logo_badge.svg';

const Auth = () =>  {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = () => {
    AuthData.logoutClickEvent(); // Assuming this handles logout logic
  };


  return (
    <>
      {!user ? (
        <button className='nav-link btn btnLogin' onClick={(e) => AuthData.loginClickEvent(e)}>
          <img title='Google Sign In' src={Logo} alt='Google Sign In' />
        </button>
      ) : (
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
                <div className='nav-link btn btnSecondary' onClick={handleLogout}>
                  Logout
                </div>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      )}
    </>
  );
};

export default Auth;
