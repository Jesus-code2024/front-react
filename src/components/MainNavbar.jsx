import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tecsupLogoHeader from '../assets/Logo-Header.png';

function MainNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken'); 
        localStorage.removeItem('emailLoggedIn'); 

        window.dispatchEvent(new Event('storage')); // Notifica a otros componentes que el token ha cambiado

        navigate('/login'); 
        console.log('Sesión cerrada. Redirigiendo a /login.'); 
    };

    return (
        <Navbar bg="light" expand="lg" className="main-app-header-custom">
            <Container fluid>
                <Navbar.Brand href="/home">
                    <img
                        src={tecsupLogoHeader}
                        alt="Tecsup Eventos Logo"
                        className="header-logo-image"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={() => navigate('/home')}>Inicio</Nav.Link>
                        <Nav.Link onClick={() => navigate('/publications')}>Publicaciones</Nav.Link>
                        <Nav.Link onClick={() => navigate('/carreras')}>Carreras</Nav.Link>
                        <Nav.Link onClick={() => navigate('/departamentos')}>Departamentos</Nav.Link>
                        <Nav.Link onClick={() => navigate('/eventos')}>Eventos</Nav.Link>
                        <Nav.Link onClick={() => navigate('/webinars')}>Webinars</Nav.Link>
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