// src/components/MainNavbar.jsx
import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import tecsupLogoHeader from '../assets/Logo-Header.png';


import '../MainNavbar.css';


function MainNavbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para la autenticación
    const [userEmail, setUserEmail] = useState(null); // Para mostrar el email si está logueado

    // Escucha los cambios en localStorage para actualizar el estado de autenticación
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwtToken');
            const email = localStorage.getItem('emailLoggedIn'); // Asumiendo que guardas el email
            setIsAuthenticated(!!token); // Si el token existe, está autenticado
            setUserEmail(email);
        };

        // Verifica al montar el componente
        checkAuth();

        // Escucha el evento 'storage' para cambios en localStorage (ej. desde OAuth2RedirectHandler)
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('emailLoggedIn'); // Elimina también el email
        window.dispatchEvent(new Event('storage')); // Notifica a otros componentes
        navigate('/login');
        console.log('Sesión cerrada. Redirigiendo a /login.');
    };

    return (
        // Usamos bg="dark" para el fondo oscuro como en la imagen.
        // variant="dark" para que el texto sea claro en un fondo oscuro.
        // fixed="top" para que la barra se quede fija en la parte superior (opcional).
        <Navbar bg="dark" variant="dark" expand="lg" className="main-navbar-custom">
            <Container fluid> {/* Puedes usar 'fluid' si quieres que ocupe todo el ancho */}
                {/* Logo y nombre de la marca */}
                <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
                    <img
                        src={tecsupLogoHeader} // Tu logo actual, la ruta es '../assets/Logo-Header.png'
                        alt="Tecsup Logo"
                        className="navbar-logo me-2" // Agrega margen a la derecha
                        style={{ height: '40px' }} // Ajusta el tamaño según tu logo y diseño
                    />
                    <span className="navbar-brand-text">Tecsup Anuncios</span> {/* Texto junto al logo */}
                </Navbar.Brand>

                {/* Botón de hamburguesa para móviles */}
                <Navbar.Toggle aria-controls="main-navbar-nav" />

                {/* Contenido del menú colapsable */}
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto"> {/* "me-auto" para empujar los elementos a la izquierda */}
                        {/* Usar Link de react-router-dom con as={Link} */}
                        <Nav.Link as={Link} to="/home">Inicio</Nav.Link>
                        <Nav.Link as={Link} to="/publications">Publicaciones</Nav.Link>
                        <Nav.Link as={Link} to="/carreras">Carreras</Nav.Link>
                        <Nav.Link as={Link} to="/departamentos">Departamentos</Nav.Link>
                        <Nav.Link as={Link} to="/eventos">Eventos</Nav.Link>
                        <Nav.Link as={Link} to="/webinars">Webinars</Nav.Link>
                    </Nav>

                    <Nav className="ms-auto align-items-center"> {/* "ms-auto" para empujar a la derecha, centrar items */}
                        {isAuthenticated ? (
                            <>
                                {/* Botón "Crear Evento" */}
                                <Button
                                    variant="outline-light" // Fondo claro con borde claro
                                    className="me-3 nav-button-create-event" // Clase para estilos y margen
                                    onClick={() => navigate('/evento/new')} // Ruta que tienes para crear eventos
                                >
                                    Crear Evento
                                </Button>

                                {/* Email de usuario (opcional, si lo quieres mostrar) */}
                                {userEmail && <span className="text-light me-3 user-email-text">{userEmail}</span>}

                                {/* Botón de Cerrar Sesión */}
                                <Button variant="danger" onClick={handleLogout}>
                                    Cerrar Sesión
                                </Button>
                            </>
                        ) : (
                            // Si no está autenticado, mostrar botón de inicio de sesión
                            <Button variant="outline-light" onClick={() => navigate('/login')}>
                                Iniciar Sesión
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MainNavbar;