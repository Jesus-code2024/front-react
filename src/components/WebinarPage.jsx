// src/components/WebinarsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, InputGroup, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const API_URL_WEBINARS = 'http://localhost:8080/api/webinars'; 
const BASE_URL = 'http://localhost:8080'; 

const formatLocalDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

function WebinarsPage() {
    const [webinars, setWebinars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchWebinars = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_WEBINARS, { headers: getAuthHeaders() });
            setWebinars(response.data);
        } catch (err) {
            console.error('Error al cargar los webinars:', err);
            setError('No se pudieron cargar los webinars. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para ver los webinars.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebinars();
    }, []);

    const handleCreateWebinarClick = () => {
        navigate('/webinar/new'); 
    };

    const handleEditClick = (id) => {
        navigate(`/edit-webinar/${id}`); 
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este webinar?')) {
            try {
                await axios.delete(`${API_URL_WEBINARS}/${id}`, { headers: getAuthHeaders() });
                alert('Webinar eliminado con éxito.');
                fetchWebinars(); 
            } catch (err) {
                console.error('Error al eliminar el webinar:', err);
                if (err.response && err.response.status === 403) {
                    alert('No tienes permiso para eliminar este webinar (solo el autor puede).');
                } else {
                    alert('Hubo un error al eliminar el webinar. Por favor, intente de nuevo.');
                }
            }
        }
    };

    const filteredWebinars = webinars.filter(webinar =>
        webinar.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (webinar.descripcion && webinar.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (webinar.expositor && webinar.expositor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (webinar.autor && webinar.autor.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando webinars...</p>;
    if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;

    return (
        <Container fluid className="webinars-page-container mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1>Listado de Webinars</h1>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por título, descripción, expositor o autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
                <Col md={4} className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleCreateWebinarClick}>
                        Crear Webinar
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="table-responsive">
                        <Table striped bordered hover className="webinars-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Expositor</th>
                                    <th>Enlace</th>
                                    <th>Autor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWebinars.length > 0 ? (
                                    filteredWebinars.map((webinar) => (
                                        <tr key={webinar.id}>
                                            <td>{webinar.id}</td>
                                            <td>{webinar.titulo}</td>
                                            <td>{webinar.descripcion}</td>
                                            <td>{formatLocalDateTime(webinar.fecha)}</td>
                                            <td>{webinar.expositor || 'N/A'}</td>
                                            <td>
                                                {webinar.enlace ? (
                                                    <a href={webinar.enlace} target="_blank" rel="noopener noreferrer">Ver Enlace</a>
                                                ) : 'N/A'}
                                            </td>
                                            <td>{webinar.autor ? webinar.autor.username : 'N/A'}</td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditClick(webinar.id)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(webinar.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">No se encontraron webinars.</td> 
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

export default WebinarsPage;