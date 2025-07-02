// src/components/Footer.jsx
import React from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'; // Iconos de redes sociales
import { useNavigate } from 'react-router-dom';
import tecsupLogoFooter from '../assets/Logo-Header.png'; 

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="footer-custom mt-5 py-4">
            <Container>
                <Row className="justify-content-center text-center text-md-start">
                    {/* Columna del Logo y Copyright */}
                    <Col md={4} className="mb-4 mb-md-0">
                        <img
                            src={tecsupLogoFooter}
                            alt="Tecsup Logo"
                            className="footer-logo-image mb-3"
                            style={{ maxWidth: '150px' }} 
                        />
                        <p className="footer-text-light">
                            © 2025 Tecsup. Todos los derechos reservados.
                        </p>
                    </Col>

                    {/* Columna de Navegación Rápida */}
                    <Col md={2} className="mb-4 mb-md-0">
                        <h5 className="footer-heading">Navegación</h5>
                        <Nav className="flex-column footer-nav-links">
                            <Nav.Link onClick={() => navigate('/home')}>Inicio</Nav.Link>
                            <Nav.Link onClick={() => navigate('/publications')}>Publicaciones</Nav.Link>
                            <Nav.Link onClick={() => navigate('/carreras')}>Carreras</Nav.Link>
                            <Nav.Link onClick={() => navigate('/departamentos')}>Departamentos</Nav.Link>
                            <Nav.Link onClick={() => navigate('/eventos')}>Eventos</Nav.Link>
                            <Nav.Link onClick={() => navigate('/webinars')}>Webinars</Nav.Link>
                        </Nav>
                    </Col>

                    {/* Columna de Contacto/Más Info (Ajusta según necesites) */}
                    <Col md={2} className="mb-4 mb-md-0">
                        <h5 className="footer-heading">Contacto</h5>
                        <Nav className="flex-column footer-nav-links">
                            <Nav.Link href="#!">Acerca de nosotros</Nav.Link>
                            <Nav.Link href="#!">Contáctanos</Nav.Link>
                            <Nav.Link href="#!">Términos y Condiciones</Nav.Link>
                            <Nav.Link href="#!">Política de Privacidad</Nav.Link>
                        </Nav>
                    </Col>

                    {/* Columna de Redes Sociales */}
                    <Col md={2} className="mb-4 mb-md-0">
                        <h5 className="footer-heading">Síguenos</h5>
                        <div className="social-icons">
                            <a href="#!" className="social-icon-link me-3"><FaFacebookF size={24} /></a>
                            <a href="#!" className="social-icon-link me-3"><FaInstagram size={24} /></a>
                            <a href="#!" className="social-icon-link me-3"><FaTwitter size={24} /></a>
                            <a href="#!" className="social-icon-link"><FaYoutube size={24} /></a>
                        </div>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col className="text-center footer-final-text">
                        <p>
                            Más en Tecsup:
                            <Button variant="link" className="text-decoration-none footer-link" onClick={() => navigate('/publications')}>Ver Publicaciones</Button> |
                            <Button variant="link" className="text-decoration-none footer-link" onClick={() => navigate('/carreras')}>Ver Carreras</Button>
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;