// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Carousel, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroCarousel.css';
import '../styles/EventCardList.css'; // Asegúrate de que esta ruta sea correcta

// URLs de tu API
const API_URL_EVENTOS = 'http://localhost:8080/api/eventos';
const API_URL_WEBINARS = 'http://localhost:8080/api/webinars';
const API_URL_DESTACADOS = 'http://localhost:8080/api/destacados';
const BASE_URL = 'http://localhost:8080'; // URL base para construir las rutas de las imágenes

// Función para formatear fechas y horas
const formatLocalDateTime = (cadenaFechaHora) => {
    if (!cadenaFechaHora) return 'N/A';
    const fecha = new Date(cadenaFechaHora);
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return fecha.toLocaleDateString('es-ES', opciones);
};

function HomePage() {
    const [eventosRegulares, setEventosRegulares] = useState([]); // Eventos no destacados para la lista
    const [webinars, setWebinars] = useState([]);
    const [elementosDestacados, setElementosDestacados] = useState([]); // Items para el carrusel principal
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navegar = useNavigate(); // Hook para navegación

    // Obtiene los encabezados de autorización si hay un token JWT
    const obtenerCabecerasAuth = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Efecto para cargar los datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const cabeceras = obtenerCabecerasAuth();

                // Fetch para todos los eventos
                const respuestaEventos = await axios.get(API_URL_EVENTOS, { headers: cabeceras });
                // Filtra los eventos no destacados (asumiendo que 'destacado' es 0 o false)
                const eventosNoDestacados = respuestaEventos.data.filter(evento => evento.destacado === 0 || evento.destacado === false);
                setEventosRegulares(eventosNoDestacados);

                // Fetch para webinars
                const respuestaWebinars = await axios.get(API_URL_WEBINARS, { headers: cabeceras });
                setWebinars(respuestaWebinars.data);

                // Fetch para elementos destacados
                const respuestaDestacados = await axios.get(API_URL_DESTACADOS, { headers: cabeceras });
                setElementosDestacados(respuestaDestacados.data);

                setCargando(false); // Finaliza la carga
            } catch (err) {
                console.error('Error al cargar datos para la página de inicio:', err);
                setError('No se pudieron cargar los datos. Por favor, intente de nuevo.');
                setCargando(false);
                // Si hay un error de autorización (401), limpia el token y redirige al login
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navegar('/login');
                }
            }
        };

        cargarDatos();
    }, [navegar]); // Dependencia del hook de navegación

    // Si está cargando, muestra un spinner
    if (cargando) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p>Cargando eventos y webinars...</p>
            </Container>
        );
    }

    // Si hay un error, muestra un mensaje de alerta
    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    // renderizarTarjeta: Función para el diseño de tarjetas en 3 columnas (usado para webinars)
    const renderizarTarjeta = (item, tipo) => {
        const urlImagen = item.imagen
            ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                ? item.imagen
                : `${BASE_URL}${item.imagen}`)
            : 'https://placehold.co/400x200/png?text=No+Imagen'; // Imagen por defecto si no hay

        const titulo = item.titulo || 'Sin título';
        const descripcion = item.descripcion || 'Sin descripción';
        const infoFecha = item.fechaInicio ? formatLocalDateTime(item.fechaInicio) : (item.fecha ? formatLocalDateTime(item.fecha) : 'Fecha N/A');
        const enlace = item.enlace;

        return (
            <Col md={4} className="mb-4 d-flex align-items-stretch">
                <Card className="h-100 shadow-sm" style={{ width: '100%' }}>
                    <Card.Img variant="top" src={urlImagen} alt={titulo} style={{ height: '200px', objectFit: 'cover' }} />
                    <Card.Body className="d-flex flex-column">
                        <Card.Title className="h5">{titulo}</Card.Title>
                        <Card.Text className="text-muted">
                            {`Fecha: ${infoFecha}`}
                            {tipo === 'evento' && item.ubicacion && ` | Ubicación: ${item.ubicacion}`}
                            {tipo === 'webinar' && item.expositor && ` | Expositor: ${item.expositor}`}
                        </Card.Text>
                        <Card.Text style={{ flexGrow: 1 }}>
                            {/* Limita la descripción para la vista de tarjeta */}
                            {descripcion.length > 100 ? `${descripcion.substring(0, 100)}...` : descripcion}
                        </Card.Text>
                        <div className="mt-auto">
                            {/* Botón para ver webinar si existe el enlace */}
                            {enlace && tipo === 'webinar' && (
                                <Button
                                    variant="outline-primary"
                                    href={enlace}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="me-2"
                                >
                                    Ver Webinar
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navegar(`/${item.fechaInicio ? 'eventos' : 'webinars'}/${item.id}`)}
                            >
                                Ver Detalles
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        );
    };

    // renderizarItemListaEvento: FUNCIÓN PARA EL DISEÑO DE LISTA VERTICAL DE EVENTOS
    const renderizarItemListaEvento = (item) => {
        const urlImagen = item.imagen
            ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                ? item.imagen
                : `${BASE_URL}${item.imagen}`)
            : 'https://placehold.co/400x200/png?text=No+Imagen';

        const titulo = item.titulo || 'Sin título';
        const descripcion = item.descripcion || 'Sin descripción';
        const infoFecha = item.fechaInicio ? formatLocalDateTime(item.fechaInicio) : (item.fecha ? formatLocalDateTime(item.fecha) : 'Fecha N/A');

        return (
            <Card key={item.id} className="event-list-card mb-4">
                <Row className="g-0"> {/* g-0 elimina el espaciado interno de las columnas de Bootstrap */}
                    {item.imagen && ( // Renderiza la columna de la imagen solo si existe
                        <Col md={4} className="event-list-img-col">
                            <Card.Img src={urlImagen} alt={titulo} className="event-list-img" />
                        </Col>
                    )}
                    <Col md={item.imagen ? 8 : 12}> {/* Ocupa 8 columnas si hay imagen, 12 si no */}
                        <Card.Body className="event-list-body">
                            <Card.Title className="event-list-title">{titulo}</Card.Title>
                            <Card.Text className="event-list-text">
                                Fecha: {infoFecha}<br />
                                Ubicación: {item.ubicacion || 'N/A'}<br />
                                {/* Muestra la descripción completa o un resumen aquí */}
                                {descripcion && <p>{descripcion}</p>}
                            </Card.Text>
                            <Button
                                variant="primary"
                                className="event-list-button"
                                onClick={() => navegar(`/eventos/${item.id}`)} // Siempre navega a /eventos para estos items
                            >
                                Ver Detalles
                            </Button>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        );
    };


    return (
        <Container fluid className="home-page-container p-0">
            {/* Carrusel de Elementos Destacados (Carrusel principal en la parte superior) */}
            {elementosDestacados.length > 0 && (
                <Carousel fade className="hero-carousel">
                    {elementosDestacados.map((item, index) => (
                        <Carousel.Item key={index}>
                            <div
                                className="hero-carousel-item-bg"
                                style={{
                                    backgroundImage: `url(${item.imagen
                                        ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                                            ? item.imagen
                                            : `${BASE_URL}${item.imagen}`)
                                        : 'https://placehold.co/1920x600/png?text=Imagen+Destacada'
                                    })`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '600px'
                                }}
                            >
                                <Carousel.Caption className="hero-carousel-caption">
                                    <h3 className="hero-carousel-title">{item.titulo || 'Sin título'}</h3>
                                    <p className="hero-carousel-description">{item.descripcion || 'Descubre más sobre esto.'}</p>
                                    <Button
                                        variant="light"
                                        className="hero-carousel-button"
                                        // Ajusta la navegación si los 'destacados' pueden incluir webinars
                                        onClick={() => navegar(`/${item.fechaInicio ? 'eventos' : 'webinars'}/${item.id}`)}
                                    >
                                        Ver Detalles
                                    </Button>
                                </Carousel.Caption>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}

            {/* SECCIÓN DE PRÓXIMOS EVENTOS (LISTA VERTICAL) */}
            <Container className="mt-5">
                <h2 className="text-center mb-4">Próximos Eventos</h2>
                <div className="event-list-container"> {/* Contenedor para la lista de eventos */}
                    {eventosRegulares.length > 0 ? (
                        // Mapea los eventos regulares usando la función de renderizado de lista
                        eventosRegulares.map(evento => renderizarItemListaEvento(evento)) // <--- ¡Esto es lo crucial!
                    ) : (
                        <Row>
                            <Col className="text-center">
                                <Alert variant="info">No hay eventos disponibles en este momento.</Alert>
                            </Col>
                        </Row>
                    )}
                </div>
            </Container>

            {/* SECCIÓN DE ÚLTIMOS WEBINARS (CARRUSEL DE 3 COLUMNAS - se mantiene el diseño original) */}
            <Container className="mt-5">
                <h2 className="text-center mb-4">Últimos Webinars</h2>
                {webinars.length > 0 ? (
                    <Carousel indicators={false} interval={null} className="custom-carousel">
                        {/* Divide los webinars en grupos de 3 para el carrusel */}
                        {Array.from({ length: Math.ceil(webinars.length / 3) }).map((_, index) => (
                            <Carousel.Item key={index}>
                                <Row className="justify-content-center">
                                    {webinars.slice(index * 3, index * 3 + 3).map((webinar) => (
                                        <React.Fragment key={webinar.id}>
                                            {renderizarTarjeta(webinar, 'webinar')} {/* Utiliza renderizarTarjeta para los webinars */}
                                        </React.Fragment>
                                    ))}
                                </Row>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                ) : (
                    <Row>
                        <Col className="text-center">
                            <Alert variant="info">No hay webinars disponibles en este momento.</Alert>
                        </Col>
                    </Row>
                )}
            </Container>

            {/* Sección de Descubre más sobre Tecsup */}
            <Container className="my-5">
                <Row>
                    <Col className="text-center">
                        <h3>Descubre más sobre Tecsup</h3>
                        <p>Explora nuestras publicaciones, carreras y departamentos.</p>
                        <Button variant="outline-secondary" onClick={() => navegar('/publications')}>Ver Publicaciones</Button>
                        <Button variant="outline-secondary" className="ms-3" onClick={() => navegar('/carreras')}>Ver Carreras</Button>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}

export default HomePage;