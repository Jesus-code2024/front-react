import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Button, Row, Col } from 'react-bootstrap';
import '../../src/styles/DetalleItemPage.css'; // <-- Importar nuevo archivo CSS para estilos personalizados

const API_BASE_URL = 'http://localhost:8080/api';
const BASE_URL = 'http://localhost:8080';

const formatLocalDateTime = (cadenaFechaHora) => {
    if (!cadenaFechaHora) return 'N/A';
    const fecha = new Date(cadenaFechaHora);
    if (isNaN(fecha.getTime())) {
        return 'N/A';
    }
    const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
    const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);
    return `${fechaFormateada}, ${horaFormateada}`;
};

function DetalleItemPage() {
    console.log("DetalleItemPage: Componente montado/renderizado.");
    const { id } = useParams();
    const location = useLocation();
    const navegar = useNavigate();
    const [item, setItem] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const currentPathSegments = location.pathname.split('/');
    const tipo = currentPathSegments[1];

    console.log("DetalleItemPage: Tipo inferido de la URL:", tipo, "ID:", id);

    const obtenerCabecerasAuth = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        console.log("DetalleItemPage: useEffect ejecutado.");
        console.log("Tipo (dentro de useEffect):", tipo, "ID:", id);

        const cargarDetalles = async () => {
            setCargando(true);
            setError(null);
            try {
                const cabeceras = obtenerCabecerasAuth();
                let apiUrl = '';

                if (tipo === 'eventos') {
                    apiUrl = `${API_BASE_URL}/eventos/${id}`;
                } else if (tipo === 'webinars') {
                    apiUrl = `${API_BASE_URL}/webinars/${id}`;
                } else {
                    setError('Tipo de item no válido en la URL.');
                    setCargando(false);
                    return;
                }

                console.log("DetalleItemPage: Haciendo llamada a la API:", apiUrl);
                const response = await axios.get(apiUrl, { headers: cabeceras });
                console.log("Datos recibidos para el item:", response.data);
                setItem(response.data);
                setCargando(false);
            } catch (err) {
                console.error("Error cargando detalles del item:", err);
                setError('Error al cargar los detalles del item.');
                setCargando(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navegar('/login');
                }
            }
        };

        if (id && tipo) {
            cargarDetalles();
        } else {
            console.warn("DetalleItemPage: Faltan parámetros 'tipo' o 'id'.", { tipo, id });
            setError("No se puede cargar el detalle: faltan parámetros o tipo de URL inválido.");
            setCargando(false);
        }
    }, [id, tipo, navegar, location.pathname]);

    if (cargando) {
        return (
            <Container className="text-center my-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando detalles...</span>
                </Spinner>
                <p className="mt-3">Cargando detalles...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center my-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Alert variant="danger">
                    {error}
                </Alert>
                <Button onClick={() => navegar(-1)} className="mt-3">Volver</Button>
            </Container>
        );
    }

    if (!item) {
        return (
            <Container className="text-center my-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Alert variant="info">
                    No se encontraron detalles para este item.
                </Alert>
                <Button onClick={() => navegar(-1)} className="mt-3">Volver</Button>
            </Container>
        );
    }

    // Renderizado actual de los detalles del elemento con diseño mejorado
    return (
        <Container className="my-5 detalle-item-page">
            <Card className="shadow-lg border-0">
                {item.imagen && (
                    <div className="card-img-top-container">
                        <img
                            src={`${BASE_URL}/uploads/${item.imagen}`}
                            alt={item.titulo}
                            className="card-img-top detalle-item-image"
                        />
                    </div>
                )}
                <Card.Body className="p-5">
                    <h1 className="card-title mb-4 text-center">{item.titulo}</h1>
                    <hr className="my-4"/>
                    <Row className="g-4"> {/* g-4 para espacio entre columnas */}
                        <Col md={8}>
                            <h4 className="mb-3">Detalles Generales</h4>
                            <p className="card-text">
                                <strong>Descripción:</strong> {item.descripcion || 'No disponible'}
                            </p>
                            {item.fechaInicio && (
                                <p className="card-text">
                                    <strong>Fecha de Inicio:</strong> {formatLocalDateTime(item.fechaInicio)}
                                </p>
                            )}
                            {item.fecha && !item.fechaInicio && ( // Para webinars que solo tienen 'fecha'
                                <p className="card-text">
                                    <strong>Fecha:</strong> {formatLocalDateTime(item.fecha)}
                                </p>
                            )}
                            {item.fechaFin && (
                                <p className="card-text">
                                    <strong>Fecha de Fin:</strong> {formatLocalDateTime(item.fechaFin)}
                                </p>
                            )}
                            {item.ubicacion && (
                                <p className="card-text">
                                    <strong>Ubicación:</strong> {item.ubicacion}
                                </p>
                            )}
                            {item.capacidad && (
                                <p className="card-text">
                                    <strong>Capacidad:</strong> {item.capacidad}
                                </p>
                            )}
                        </Col>
                        <Col md={4}>
                            <h4 className="mb-3">Información Adicional</h4>
                            {item.destacado !== undefined && (
                                <p className="card-text">
                                    <strong>Destacado:</strong> {item.destacado ? 'Sí' : 'No'}
                                </p>
                            )}
                            {item.enlace && (
                                <p className="card-text">
                                    <strong>Enlace:</strong> <a href={item.enlace} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{item.enlace}</a>
                                </p>
                            )}
                            {item.expositor && (
                                <p className="card-text">
                                    <strong>Expositor:</strong> {item.expositor}
                                </p>
                            )}
                            {item.carrera && (
                                <p className="card-text">
                                    <strong>Carrera:</strong> {item.carrera.nombre}
                                </p>
                            )}
                            {item.autor && (
                                <p className="card-text">
                                    <strong>Autor:</strong> {item.autor.firstName} {item.autor.lastName}
                                </p>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-center p-4 bg-light border-top">
                    <Button variant="secondary" onClick={() => navegar(-1)} className="btn-lg">
                        Volver
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default DetalleItemPage;