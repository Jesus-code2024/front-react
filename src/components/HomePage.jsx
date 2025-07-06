// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Carousel, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroCarousel.css';
import '../styles/EventCardList.css'; // Asegúrate de que esta ruta sea correcta

const API_URL_EVENTOS = 'http://localhost:8080/api/eventos';
const API_URL_WEBINARS = 'http://localhost:8080/api/webinars';
const API_URL_DESTACADOS = 'http://localhost:8080/api/destacados';
const BASE_URL = 'http://localhost:8080';

// MODIFICACIÓN CRÍTICA AQUÍ: formatLocalDateTime para incluir Fecha y Hora
const formatLocalDateTime = (cadenaFechaHora) => {
    if (!cadenaFechaHora) return 'N/A';
    const fecha = new Date(cadenaFechaHora);

    // Si la fecha no es válida (ej. 'Invalid Date'), devuelve 'N/A'
    if (isNaN(fecha.getTime())) {
        return 'N/A';
    }
    
    // Opciones para la fecha (ej: "5 de julio de 2025")
    const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);

    // Opciones para la hora (ej: "01:45 AM"). Añadimos hour12: true si quieres AM/PM
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true }; 
    const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);

    // Combina la fecha y la hora
    return `${fechaFormateada}, ${horaFormateada}`;
};


function HomePage() {
    const [eventosRegulares, setEventosRegulares] = useState([]);
    const [webinars, setWebinars] = useState([]);
    const [elementosDestacados, setElementosDestacados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navegar = useNavigate();

    const obtenerCabecerasAuth = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const cabeceras = obtenerCabecerasAuth();
                const eventosRes = await axios.get(API_URL_EVENTOS, { headers: cabeceras });
                const eventosNoDestacados = eventosRes.data.filter(e => e.destacado === 0 || e.destacado === false);
                setEventosRegulares(eventosNoDestacados);

                const webinarsRes = await axios.get(API_URL_WEBINARS, { headers: cabeceras });
                setWebinars(webinarsRes.data);
                // console.log("Webinars cargados:", webinarsRes.data); // Puedes descomentar para depurar

                const destacadosRes = await axios.get(API_URL_DESTACADOS, { headers: cabeceras });
                setElementosDestacados(destacadosRes.data);

                setCargando(false);
            } catch (err) {
                setError('Error cargando datos.');
                setCargando(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navegar('/login');
                }
            }
        };

        cargarDatos();
    }, [navegar]);

    // renderizarItemListaEvento: FUNCIÓN PARA EL DISEÑO DE BANNER DE EVENTO
    const renderizarItemListaEvento = (item) => {
        const urlImagen = item.imagen
            ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                ? item.imagen
            : `${BASE_URL}/uploads/${item.imagen}`) // <-- Asegúrate de que esta línea esté correcta
            : 'https://placehold.co/1200x300/png?text=Banner+Evento';

        const titulo = item.titulo || 'Sin título';
        const ubicacion = item.ubicacion || 'Ubicación N/A';
        // CAMBIO CRÍTICO AQUÍ: Usar directamente el resultado de formatLocalDateTime
        const fechaHoraCompleta = formatLocalDateTime(item.fechaInicio || item.fecha);

         return (
            <div key={item.id} className="event-banner-card mb-4" style={{ backgroundImage: `url(${urlImagen})` }}>
                <div className="event-banner-overlay">
                    <div className="event-banner-content">
                        <h3 className="event-banner-title">{titulo}</h3>
                        <p className="event-banner-details">
                            📍 <strong>{ubicacion}</strong> 
                            {fechaHoraCompleta !== 'N/A' && <span> | 🗓️ <strong>{fechaHoraCompleta}</strong></span>}
                        </p>
                        <Button
                            variant="primary" 
                            className="event-banner-button"
                            // CAMBIO AQUÍ: Navega a /eventos/:id
                            onClick={() => navegar(`/eventos/${item.id}`)} 
                        >
                            Ver Detalles
                        </Button>
                    </div>
                    <div className="event-banner-indicator">+ 26</div> 
                </div>
            </div>
        );
    };

    // renderizarTarjeta (FUNCIÓN PARA LOS WEBINARS, etc.)
    const renderizarTarjeta = (item, tipo) => {
        const urlImagen = item.imagen
            ? (item.imagen.startsWith('http://') || item.imagen.startsWith('https://')
                ? item.imagen
            : `${BASE_URL}/uploads/${item.imagen}`) // <-- Asegúrate de que esta línea esté correcta
            : 'https://placehold.co/400x200/png?text=No+Imagen'; // Imagen por defecto si no hay

        const titulo = item.titulo || 'Sin título';
        const descripcion = item.descripcion || 'Sin descripción';
        // Usamos la nueva formatLocalDateTime para la fecha completa
        const infoFecha = item.fechaInicio ? formatLocalDateTime(item.fechaInicio) : (item.fecha ? formatLocalDateTime(item.fecha) : 'Fecha N/A');
        const enlace = item.enlace;

        return (
            <Col md={4} className="mb-4 d-flex align-items-stretch">
                <Card className="h-100 shadow-sm" style={{ width: '100%' }}>
                    {/* ... (Card.Img, Card.Body, Card.Title, Card.Text) ... */}
                        <Card.Text className="text-muted">
                            {`Fecha: ${infoFecha}`} {/* Mostrar la fecha completa aquí */}
                            {tipo === 'evento' && item.ubicacion && ` | Ubicación: ${item.ubicacion}`}
                            {tipo === 'webinar' && item.expositor && ` | Expositor: ${item.expositor}`}
                        </Card.Text>
                    {/* ... (Card.Text descripción) ... */}
                    <div className="mt-auto">
                        {/* Botón para ver webinar si existe el enlace */}
                        {item.enlace && tipo === 'webinar' && ( // Se agregó item.enlace para asegurar que el botón solo aparezca si hay enlace
                            <Button
                                variant="outline-primary"
                                href={item.enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="me-2"
                            >
                                Ir al Webinar
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            // CAMBIO AQUÍ: Navega dinámicamente según el tipo de item
                            onClick={() => navegar(`/${item.fechaInicio ? 'eventos' : 'webinars'}/${item.id}`)} 
                        >
                            Ver Detalles
                        </Button>
                    </div>
                </Card>
            </Col>
        );
    };


    if (cargando) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" />
            <p>Cargando...</p>
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

    return (
        <Container fluid className="home-page-container p-0">
            {/* Destacados */}
            <Carousel fade className="hero-carousel">
                {elementosDestacados.map((item, index) => (
                    <Carousel.Item key={index}>
                        <div
                            className="hero-carousel-item-bg"
                            style={{
        backgroundImage: `url(${item.imagen?.startsWith('http') ? item.imagen : BASE_URL + '/uploads/' + item.imagen})`, // <--- Asegúrate de que aquí sea '/uploads/'
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '600px'
                            }}
                        >
                            <Carousel.Caption className="hero-carousel-caption">
                                <h3 className="hero-carousel-title">{item.titulo}</h3>
                                <p className="hero-carousel-description">{item.descripcion}</p>
                                <Button
                                    variant="light"
                                    className="hero-carousel-button"
onClick={() => navegar(`/${item.tipo}s/${item.id}`)}                                >
                                    Ver Detalles
                                </Button>
                            </Carousel.Caption>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>

            {/* Lista de eventos (Próximos Eventos) */}
            <Container className="mt-5">
                <h2 className="text-center mb-4">Próximos Eventos</h2>
                <div className="event-list-container">
                    {eventosRegulares.length > 0 ? ( 
                        eventosRegulares.map(renderizarItemListaEvento)
                    ) : (
                        <Row><Col className="text-center"><Alert variant="info">No hay eventos disponibles.</Alert></Col></Row>
                    )}
                </div>
            </Container>

            {/* SECCIÓN DE ÚLTIMOS WEBINARS (CARRUSEL DE 3 COLUMNAS - REINTRODUCIDA) */}
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