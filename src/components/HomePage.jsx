// src/pages/HomePage.jsx (o donde tengas tu componente de inicio)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Carousel, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_URL_EVENTS = 'http://localhost:8080/api/eventos';
const API_URL_WEBINARS = 'http://localhost:8080/api/webinars';
const BASE_URL = 'http://localhost:8080';

// Función de utilidad para manejar fechas (ya la tienes en WebinarsPage)
const formatLocalDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

function HomePage() {
    const [events, setEvents] = useState([]);
    const [webinars, setWebinars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener eventos
                const eventsResponse = await axios.get(API_URL_EVENTS, { headers: getAuthHeaders() });
                setEvents(eventsResponse.data);

                // Obtener webinars
                const webinarsResponse = await axios.get(API_URL_WEBINARS, { headers: getAuthHeaders() });
                setWebinars(webinarsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar datos para la página de inicio:', err);
                setError('No se pudieron cargar los datos. Por favor, intente de nuevo.');
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p>Cargando eventos y webinars...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    // Función para renderizar una tarjeta de Evento/Webinar
    const renderCard = (item, type) => {
        const imageUrl = item.imagen
            ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                ? item.imagen
                : `${BASE_URL}${item.imagen}`)
            : 'https://via.placeholder.com/400x200?text=No+Imagen'; // Imagen de placeholder

        const title = item.titulo || item.nombre || 'Sin título'; // Ajusta según tus campos reales
        const description = item.descripcion || 'Sin descripción';
        const dateInfo = item.fecha_inicio ? formatLocalDateTime(item.fecha_inicio) : (item.fecha ? formatLocalDateTime(item.fecha) : 'Fecha N/A');
        const link = item.enlace; // Para webinars

        return (
            <Col md={4} className="mb-4 d-flex align-items-stretch">
                <Card className="h-100 shadow-sm" style={{ width: '100%' }}>
                    <Card.Img variant="top" src={imageUrl} alt={title} style={{ height: '200px', objectFit: 'cover' }} />
                    <Card.Body className="d-flex flex-column">
                        <Card.Title className="h5">{title}</Card.Title>
                        <Card.Text className="text-muted">
                            {type === 'evento' ? `Fecha: ${dateInfo}` : `Fecha: ${dateInfo}`}
                            {type === 'evento' && item.ubicacion && ` | Ubicación: ${item.ubicacion}`}
                            {type === 'webinar' && item.expositor && ` | Expositor: ${item.expositor}`}
                        </Card.Text>
                        <Card.Text style={{ flexGrow: 1 }}>
                            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                        </Card.Text>
                        <div className="mt-auto"> {/* Empuja los botones hacia abajo */}
                            {link && type === 'webinar' && (
                                <Button
                                    variant="outline-primary"
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="me-2"
                                >
                                    Ver Webinar
                                </Button>
                            )}
                            {/* Puedes agregar un botón para ver más detalles */}
                            <Button variant="primary" onClick={() => navigate(`/${type === 'evento' ? 'eventos' : 'webinars'}/${item.id}`)}>
                                Ver Detalles
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        );
    };

    return (
        <Container fluid className="home-page-container mt-4">
            {/* Sección de Eventos */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Próximos Eventos</h2>
                    {events.length > 0 ? (
                        <Carousel indicators={false} interval={null} className="custom-carousel">
                            {/* Divide los eventos en grupos de 3 para el carrusel */}
                            {Array.from({ length: Math.ceil(events.length / 3) }).map((_, index) => (
                                <Carousel.Item key={index}>
                                    <Row className="justify-content-center">
                                        {events.slice(index * 3, index * 3 + 3).map((event) => (
                                            renderCard(event, 'evento')
                                        ))}
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <Alert variant="info" className="text-center">No hay eventos disponibles en este momento.</Alert>
                    )}
                </Col>
            </Row>

            {/* Sección de Webinars */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Últimos Webinars</h2>
                    {webinars.length > 0 ? (
                        <Carousel indicators={false} interval={null} className="custom-carousel">
                            {/* Divide los webinars en grupos de 3 para el carrusel */}
                            {Array.from({ length: Math.ceil(webinars.length / 3) }).map((_, index) => (
                                <Carousel.Item key={index}>
                                    <Row className="justify-content-center">
                                        {webinars.slice(index * 3, index * 3 + 3).map((webinar) => (
                                            renderCard(webinar, 'webinar')
                                        ))}
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <Alert variant="info" className="text-center">No hay webinars disponibles en este momento.</Alert>
                    )}
                </Col>
            </Row>

            {/* Sección adicional para otras noticias o CTA */}
            <Row className="my-5">
                <Col className="text-center">
                    <h3>Descubre más sobre Tecsup</h3>
                    <p>Explora nuestras publicaciones, carreras y departamentos.</p>
                    <Button variant="outline-secondary" onClick={() => navigate('/publications')}>Ver Publicaciones</Button>
                    <Button variant="outline-secondary" className="ms-3" onClick={() => navigate('/carreras')}>Ver Carreras</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;