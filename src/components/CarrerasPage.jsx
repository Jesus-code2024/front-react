import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/CarrerasPage.css';

const API_URL_CARRERAS = 'http://localhost:8080/api/carreras';
const BASE_URL = 'http://localhost:8080';

function CarrerasPage() {
    const [carreras, setCarreras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const obtenerCabecerasAuth = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const cargarCarreras = async () => {
            try {
                const headers = obtenerCabecerasAuth();
                const response = await axios.get(API_URL_CARRERAS, { headers });
                setCarreras(response.data);
                setCargando(false);
            } catch (err) {
                console.error("Error cargando carreras:", err);
                setError('Error al cargar las carreras.');
                setCargando(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        };

        cargarCarreras();
    }, [navigate]);

    if (cargando) {
        return (
            <Container className="text-center my-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando carreras...</span>
                </Spinner>
                <p>Cargando carreras...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center my-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const filteredCarreras = carreras.filter(carrera =>
        carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrera.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrera.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="my-5 carreras-page">
            <h1 className="text-center mb-4">Explora Nuestras Carreras</h1>

            <Row className="mb-4 justify-content-center">
                <Col md={6}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre, código o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {filteredCarreras.length === 0 && !cargando && !error ? (
                <Alert variant="info" className="text-center">
                    No se encontraron carreras que coincidan con la búsqueda.
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {filteredCarreras.map((carrera) => (
                        <Col key={carrera.id} className="d-flex align-items-stretch">
                            <Card className="carrera-card shadow-sm h-100">
                                <div className="carrera-card-image-container">
                                    <Card.Img
                                        variant="top"
                                        src={carrera.imagen
                                            ? `${BASE_URL}/uploads/${carrera.imagen}`
                                            : 'https://via.placeholder.com/400x250/F0F0F0/808080?text=No+Imagen'}
                                        alt={carrera.nombre}
                                        className="carrera-card-img"
                                    />
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <div className="card-tag">
                                        <i className="bi bi-mortarboard-fill me-2"></i>
                                        <span>{carrera.codigo}</span>
                                    </div>
                                    <Card.Title className="carrera-card-title mt-2">{carrera.nombre}</Card.Title>
                                    <Card.Text className="text-muted flex-grow-1">
                                        {carrera.descripcion} {/* 🎉 MOSTRAR TODO SIN CORTAR */}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <div className="text-center mt-5">
                <Button variant="secondary" onClick={() => navigate('/')}>
                    Volver al Inicio
                </Button>
            </div>
        </Container>
    );
}

export default CarrerasPage;
