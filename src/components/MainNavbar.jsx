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
                        <Nav.Link onClick={() => navigate('/dashboard')}>Inicio</Nav.Link>
                        <Nav.Link onClick={() => navigate('/publications')}>Publicaciones</Nav.Link>
                        
                        {/* NUEVOS ENLACES DIRECTOS A PÁGINAS DE LISTADO */}
                        <Nav.Link onClick={() => navigate('/carreras')}>Carreras</Nav.Link>
                        <Nav.Link onClick={() => navigate('/departamentos')}>Departamentos</Nav.Link>
                        <Nav.Link onClick={() => navigate('/eventos')}>Eventos</Nav.Link>
                        <Nav.Link onClick={() => navigate('/webinars')}>Webinars</Nav.Link>

                        {/* Si aún necesitas los enlaces de "Crear" directos, puedes añadirlos aquí también */}
                        {/* <Nav.Link onClick={() => navigate('/publications/new')}>Crear Publicación</Nav.Link> */}
                        {/* <Nav.Link onClick={() => navigate('/carreras/new')}>Crear Carrera</Nav.Link> */}
                        {/* <Nav.Link onClick={() => navigate('/departamentos/new')}>Crear Departamento</Nav.Link> */}
                        {/* <Nav.Link onClick={() => navigate('/eventos/new')}>Crear Evento</Nav.Link> */}
                        {/* <Nav.Link onClick={() => navigate('/webinars/new')}>Crear Webinar</Nav.Link> */}

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