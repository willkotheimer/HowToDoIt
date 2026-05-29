import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Auth from '../Auth';
import logo from '../../styles/images/logo.png';

export default function Nav(props) {
  // const { user } = props;

  return (
    <>
    <div className="nav navbar-container p-2 d-flex justify-content-center align-items-center">
      <header className="brand-container">
        <NavLink exact to="/" activeClassName="active" className='brand'><img alt={logo} src={logo} /></NavLink>
      </header>
      <nav className="navbar">
        <div className="navbar-items">
        <NavLink exact to="/" activeClassName="active" className='brand'>Household</NavLink>
          <NavLink exact to="/assignchores" activeClassName="active" className="navbar-item">
            Assign Chores
          </NavLink>
          <NavLink exact to="/assignmentBoard" activeClassName="active" className="navbar-item">
            AssignmentBoard
          </NavLink>
        </div>
      </nav>
      <div className='user-icon-container '>
        <Auth />
      </div>
    </div>
  </>
  );
}
