import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, InputGroup, FormControl, Button } from 'react-bootstrap'; // Importa Button
import { FaSearch } from 'react-icons/fa';

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

    const handleCreateEventClick = () => {
        navigate('/evento/new'); // Asegúrate de que esta ruta coincida con tu App.js
    };

    const handleEditClick = (id) => {
        navigate(`/edit-evento/${id}`); // Asegúrate de que esta ruta coincida con tu App.js
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            try {
                await axios.delete(`${API_URL_EVENTOS}/${id}`, { headers: getAuthHeaders() });
                alert('Evento eliminado con éxito.');
                fetchEventos(); // Vuelve a cargar la lista de eventos después de eliminar
            } catch (err) {
                console.error('Error al eliminar el evento:', err);
                if (err.response && err.response.status === 403) {
                    alert('No tienes permiso para eliminar este evento (solo el autor puede).');
                } else {
                    alert('Hubo un error al eliminar el evento. Por favor, intente de nuevo.');
                }
            }
        }
    };

    const filteredEventos = eventos.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evento.descripcion && evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evento.ubicacion && evento.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evento.autor && evento.autor.username.toLowerCase().includes(searchTerm.toLowerCase()))
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

            <Row className="mb-3"> {/* Contenedor para el buscador y el botón */}
                <Col md={8}> {/* Columna para el buscador */}
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por título, descripción, ubicación o autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
                <Col md={4} className="d-flex justify-content-end"> {/* Columna para el botón "Crear Evento" */}
                    <Button variant="primary" onClick={handleCreateEventClick}>
                        Crear Evento
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="table-responsive">
                        <Table striped bordered hover className="eventos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Ubicación</th>
                                    <th>Capacidad</th>
                                    <th>Autor</th>
                                    <th>Imagen</th>
                                    <th>Acciones</th> {/* Nueva columna para Editar/Eliminar */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEventos.length > 0 ? (
                                    filteredEventos.map((evento) => (
                                        <tr key={evento.id}>
                                            <td>{evento.id}</td>
                                            <td>{evento.titulo}</td>
                                            <td>{evento.descripcion}</td>
                                            <td>{formatLocalDateTime(evento.fecha_inicio || evento.fechaInicio)}</td>
                                            <td>{formatLocalDateTime(evento.fecha_fin || evento.fechaFin)}</td>
                                            <td>{evento.ubicacion || 'N/A'}</td>
                                            <td>{evento.capacidad || 'N/A'}</td>
                                            <td>{evento.autor ? evento.autor.username : 'N/A'}</td>
                                            <td>
                                                {evento.imagen ? (
                                                    <img
                                                        src={evento.imagen.startsWith('http://') || evento.imagen.startsWith('https://')
                                                            ? evento.imagen
                                                            : `${BASE_URL}${evento.imagen}`}
                                                        alt={evento.titulo || 'Imagen del evento'}
                                                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    'No image'
                                                )}
                                            </td>
                                            <td>
                                                {/* Botones de Editar y Eliminar */}
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2" // Margen a la derecha
                                                    onClick={() => handleEditClick(evento.id)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(evento.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">No se encontraron eventos.</td> {/* colSpan ajustado a 10 */}
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default EventosPage;