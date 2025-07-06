import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, InputGroup, FormControl, Card } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../styles/EventosPage.css';

const API_URL_EVENTOS = 'http://localhost:8080/api/eventos';
const BASE_URL = 'http://localhost:8080';

const formatLocalDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

function EventosPage() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchEventos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_EVENTOS, { headers: getAuthHeaders() });
            setEventos(response.data);
        } catch (err) {
            console.error('Error al cargar los eventos:', err);
            setError('No se pudieron cargar los eventos. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para ver los eventos.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventos();
    }, []);

    const handleViewDetailsClick = (id) => {
        navigate(`/eventos/${id}`);
    };

    const filteredEventos = eventos.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evento.descripcion && evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evento.ubicacion && evento.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evento.autor && evento.autor.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evento.carrera && evento.carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando eventos...</p>;
    if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;

    return (
        <Container fluid className="eventos-page-container mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1>Listado de Eventos</h1>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={12}>
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por título, descripción, ubicación, autor o carrera..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>

            {filteredEventos.length > 0 ? (
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 event-cards-grid">
                    {filteredEventos.map((evento) => (
                        <Col key={evento.id}>
                            <Card className="event-card" onClick={() => handleViewDetailsClick(evento.id)}>
                                <div className="event-card-image-container">
                                    {evento.imagen ? (
                                        <Card.Img
                                            variant="top"
                                            src={`${BASE_URL}/uploads/${evento.imagen}`}
                                            alt={evento.titulo || 'Imagen del evento'}
                                            className="event-image"
                                        />
                                    ) : (
                                        <div className="no-image-placeholder">No Image</div>
                                    )}
                                    {evento.carrera && (
                                        <div className="event-career-overlay">
                                            {evento.carrera.nombre}
                                        </div>
                                    )}
                                </div>
                                <Card.Body className="event-card-body">
                                    <Card.Title className="event-title-overlay">{evento.titulo}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="info" className="mt-4 text-center">
                    No se encontraron eventos que coincidan con la búsqueda.
                </Alert>
            )}
        </Container>
    );
}

export default EventosPage;
