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
import { useAuth } from '../../context/AuthContext';
import logo from '../../styles/images/logo.png';

export default function Nav() {
  const { canWrite } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <Navbar className="nav navbar-container" dark expand="md">
      <NavbarBrand tag={NavLink} exact to="/" className="brand" onClick={close}>
        <img alt="HowToDoIt" src={logo} />
        <span className="brand-text">HowToDoIt</span>
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <RsNav className="navbar-items ml-auto align-items-md-center" navbar>
          <NavItem>
            <NavLink exact to="/" activeClassName="active" className="navbar-item" onClick={close}>
              Browse
            </NavLink>
          </NavItem>
          {canWrite && (
            <NavItem>
              <NavLink exact to="/create" activeClassName="active" className="navbar-item" onClick={close}>
                New Sequence
              </NavLink>
            </NavItem>
          )}
          <NavItem className="user-icon-container">
            <Auth />
          </NavItem>
        </RsNav>
      </Collapse>
    </Navbar>
  );
}
