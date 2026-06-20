import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav as RsNav,
  NavItem,
} from 'reactstrap';
import Auth from '../Auth';
import logo from '../../styles/images/logo.png';

export default function Nav(props) {
  // const { user } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <Navbar className="nav navbar-container" dark expand="md">
      <NavbarBrand tag={NavLink} exact to="/" className="brand" onClick={close}>
        <img alt="The Play Book" src={logo} />
        <span className="brand-text">Playbook</span>
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <RsNav className="navbar-items ml-auto align-items-md-center" navbar>
          <NavItem>
            <NavLink exact to="/dashboard" activeClassName="active" className="navbar-item" onClick={close}>
              Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/assignmentBoard" activeClassName="active" className="navbar-item" onClick={close}>
              Task Board
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/playbook" activeClassName="active" className="navbar-item" onClick={close}>
              Runbook
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/profiles" activeClassName="active" className="navbar-item" onClick={close}>
              Profiles
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/settings" activeClassName="active" className="navbar-item" onClick={close}>
              Settings
            </NavLink>
          </NavItem>
          <NavItem className="user-icon-container">
            <Auth />
          </NavItem>
        </RsNav>
      </Collapse>
    </Navbar>
  );
}
