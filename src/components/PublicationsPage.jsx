// src/components/PublicationsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Button,
    Table,
    Form,
    InputGroup,
    FormControl,
    Nav, // Para las pestañas
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa'; // Íconos para acciones

// URL base de tu backend de Spring Boot para los anuncios/publicaciones
const API_URL_PUBLICACIONES = 'http://localhost:8080/api/anuncios';

function PublicationsPage() {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); 
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken'); 
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const mapTipoAnuncioToDisplay = (tipoEnum) => {
        switch (tipoEnum) {
            case 'GEN':
                return 'General';
            case 'CAR':
                return 'Carrera';
            case 'DEP':
                return 'Departamento';
            default:
                return tipoEnum; 
        }
    };

    // Función para obtener las publicaciones del backend
    const fetchPublications = async (type = 'all') => {
        setLoading(true);
        setError(null);
        let url = API_URL_PUBLICACIONES;

        // Construye la URL para filtrar por tipo, usando los nombres exactos de tu enum de Java
        if (type !== 'all') {
            url = `${API_URL_PUBLICACIONES}/tipo/${type}`;
        }

        try {
            // Incluir el token en los headers de la petición
            const response = await axios.get(url, { headers: getAuthHeaders() });
            setPublications(response.data);
        } catch (err) {
            console.error('Error al cargar las publicaciones:', err);
            setError('No se pudieron cargar las publicaciones. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                // Redirigir al login si no está autorizado (sesión expirada, token inválido)
                localStorage.removeItem('jwtToken'); // Limpiar el token inválido
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                // Si el usuario no tiene los roles necesarios para el endpoint
                setError('No tienes permiso para ver estas publicaciones.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublications(activeTab); 
    }, [activeTab]); 
    // Manejador del cambio de pestaña
    const handleTabSelect = (selectedKey) => {
        setActiveTab(selectedKey);
    };

    const filteredPublications = publications.filter(pub =>
        pub.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.contenido && pub.contenido.toLowerCase().includes(searchTerm.toLowerCase())) || // Usar 'contenido'
        (pub.autor && ( // <-- Inicio de la corrección para la búsqueda del autor
            (pub.autor.firstName && pub.autor.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pub.autor.lastName && pub.autor.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pub.autor.username && pub.autor.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pub.autor.email && pub.autor.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )) 
    );

    const handleCreatePublication = () => {
        console.log('Navegar a la página de creación de publicación');
        navigate('/publications/new'); 
    };

    const handleEditPublication = (id) => {
        console.log('Editar publicación con ID:', id);
        navigate(`/publications/edit/${id}`); 
    };

    const handleDeletePublication = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
            try {
                await axios.delete(`${API_URL_PUBLICACIONES}/${id}`, { headers: getAuthHeaders() }); 
                console.log('Publicación eliminada con ID:', id);
                fetchPublications(activeTab); 
            } catch (err) {
                console.error('Error al eliminar publicación:', err);
                setError('No se pudo eliminar la publicación.');
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else if (err.response && err.response.status === 403) {
                    setError('No tienes permiso para eliminar esta publicación.');
                } else if (err.response && err.response.status === 400 && err.response.data.includes("No tienes permiso para eliminar este anuncio")) {
                    setError(err.response.data);
                }
            }
        }
    };

    if (loading) return <p>Cargando publicaciones...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <Container fluid className="publications-page-container mt-4">
            <Row className="mb-4 align-items-center">
                <Col md={6}>
                    <h1>Listado de Publicaciones</h1>
                </Col>
                <Col md={6} className="text-md-end">
                    <Button variant="primary" onClick={handleCreatePublication}>
                        <FaPlus className="me-2" /> Crear Publicación
                    </Button>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={8}>
                    <Nav variant="tabs" defaultActiveKey="all" onSelect={handleTabSelect}>
                        <Nav.Item>
                            <Nav.Link eventKey="all">Todos</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="GEN">Anuncios Generales</Nav.Link> 
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="CAR">Anuncios de Carrera</Nav.Link> 
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="DEP">Anuncios de Departamento</Nav.Link> 
                        </Nav.Item>

                    </Nav>
                </Col>
                <Col md={4}>
                    {/* Barra de Búsqueda */}
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por título, descripción, autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary">
                            <FaSearch />
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="table-responsive">
                        <Table striped bordered hover className="publications-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Detalles</th>
                                    <th>Fecha</th>
                                    <th>Autor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPublications.length > 0 ? (
                                    filteredPublications.map((pub) => (
                                        <tr key={pub.id}> {/* Asegúrate que pub.id sea el ID único de tu publicación */}
                                            <td>{mapTipoAnuncioToDisplay(pub.tipo)}</td> {/* Mapear el enum a texto legible */}
                                            <td>{pub.titulo}</td>
                                            <td>{pub.contenido}</td> {/* Propiedad 'contenido' de tu backend */}
                                            <td>
                                                <Button variant="info" size="sm" onClick={() => navigate(`/publications/${pub.id}`)}>
                                                    Ver
                                                </Button>
                                            </td>
                                            <td>
                                                {pub.fechaPublicacion ? new Date(pub.fechaPublicacion).toLocaleDateString() : 'N/A'}
                                            </td> {/* 'fechaPublicacion' de tu backend */}
                                            <td>
                                                {pub.autor ? 
                                                    (pub.autor.firstName && pub.autor.lastName ? 
                                                        `${pub.autor.firstName} ${pub.autor.lastName}` : // Si ambos existen, mostrar nombre completo
                                                        (pub.autor.firstName || pub.autor.username || pub.autor.email || 'Desconocido') // Si no, intentar uno de estos
                                                    ) : 
                                                    'N/A'
                                                }
                                            </td> {/* Accede a firstName, lastName, username o email */}
                                            <td>
                                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditPublication(pub.id)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeletePublication(pub.id)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">No se encontraron publicaciones.</td>
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

export default PublicationsPage;