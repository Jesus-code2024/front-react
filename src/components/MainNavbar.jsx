// src/components/MainNavbar.jsx
import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tecsupLogoHeader from '../assets/Logo-Header.png';

function MainNavbar() {
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('emailLoggedIn');

  window.dispatchEvent(new Event('storage'));

  navigate('/login');
};

  return (
    <Navbar bg="light" expand="lg" className="main-app-header-custom">
      <Container fluid>
        <Navbar.Brand href="/dashboard">
          <img
            src={tecsupLogoHeader}
            alt="Tecsup Eventos Logo"
            className="header-logo-image"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/publications')}>Publicaciones</Nav.Link>
<Nav.Link onClick={() => navigate('/dashboard')}>Inicio</Nav.Link>

          </Nav>
          <Nav>
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
