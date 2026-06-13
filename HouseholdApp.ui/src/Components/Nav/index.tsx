import React from 'react';
import { NavLink } from 'react-router-dom';
import Auth from '../Auth';
import logo from '../../styles/images/logo.png';

export default function Nav(props) {
  // const { user } = props;

  return (
    <>
    <div className="nav navbar-container p-2 d-flex justify-content-center align-items-center">
      <header className="brand-container">
        <NavLink exact to="/" activeClassName="active" className='brand'><img alt="The Play Book" src={logo} /></NavLink>
      </header>
      <nav className="navbar">
        <div className="navbar-items">
          <NavLink exact to="/dashboard" activeClassName="active" className="navbar-item">
            Dashboard
          </NavLink>
          <NavLink exact to="/assignmentBoard" activeClassName="active" className="navbar-item">
            Assignment Board
          </NavLink>
          <NavLink exact to="/chore-chart" activeClassName="active" className="navbar-item">
            Chore Chart
          </NavLink>
          <NavLink exact to="/playbook" activeClassName="active" className="navbar-item">
            Runbook
          </NavLink>
        </div>
      </nav>
      <div className='user-icon-container'>
        <Auth />
      </div>
    </div>
  </>
  );
}
