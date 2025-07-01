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
  // Ajusta los eventKey para que coincidan con las constantes de tu enum TipoAnuncio en Java
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'GEN', 'CAR', 'DEP', etc.
  const navigate = useNavigate();

  // Función para obtener los headers de autorización
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Asume que el token se guarda aquí en el login
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Función para mapear el enum del backend a un string legible
  const mapTipoAnuncioToDisplay = (tipoEnum) => {
    switch (tipoEnum) {
      case 'GEN':
        return 'General';
      case 'CAR':
        return 'Carrera';
      case 'DEP':
        return 'Departamento';
      // Si tu enum TipoAnuncio en Java tiene otras constantes como EVENTO o WEBINAR
      // case 'EVENTO': return 'Evento';
      // case 'WEBINAR': return 'Webinar';
      default:
        return tipoEnum; // Devuelve el enum tal cual si no hay mapeo
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
        localStorage.removeItem('token'); // Limpiar el token inválido
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
    fetchPublications(activeTab); // Cargar publicaciones al montar y al cambiar la pestaña
  }, [activeTab]); // Dependencia: re-ejecutar cuando cambia la pestaña

  // Manejador del cambio de pestaña
  const handleTabSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  // Filtrado en el frontend (puedes moverlo al backend si prefieres para datasets grandes)
  const filteredPublications = publications.filter(pub =>
    pub.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pub.contenido && pub.contenido.toLowerCase().includes(searchTerm.toLowerCase())) || // Usar 'contenido'
    (pub.autor && pub.autor.name.toLowerCase().includes(searchTerm.toLowerCase())) // Acceder a 'autor.name'
    // Agrega más campos si es necesario
  );

  // Funciones de acción (solo ejemplos, debes implementar la lógica real con tu backend)
  const handleCreatePublication = () => {
    console.log('Navegar a la página de creación de publicación');
    navigate('/publications/new'); // Por ejemplo, una nueva ruta para crear
  };

  const handleEditPublication = (id) => {
    console.log('Editar publicación con ID:', id);
    navigate(`/publications/edit/${id}`); // Por ejemplo, una nueva ruta para editar
  };

  const handleDeletePublication = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await axios.delete(`${API_URL_PUBLICACIONES}/${id}`, { headers: getAuthHeaders() }); // Endpoint de eliminación en Spring Boot
        console.log('Publicación eliminada con ID:', id);
        fetchPublications(activeTab); // Recargar la lista después de eliminar
      } catch (err) {
        console.error('Error al eliminar publicación:', err);
        setError('No se pudo eliminar la publicación.');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
          setError('No tienes permiso para eliminar esta publicación.');
        } else if (err.response && err.response.status === 400 && err.response.data.includes("No tienes permiso para eliminar este anuncio")) {
          // Esto es si tu backend devuelve "No tienes permiso para eliminar este anuncio" con 400
          setError(err.response.data);
        }
      }
    }
  };

  if (loading) return <p>Cargando publicaciones...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    // publications-page-container es el contenedor principal para esta página
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
          {/* Pestañas de Navegación/Filtro. Los eventKey deben coincidir con tus enums de Java */}
          <Nav variant="tabs" defaultActiveKey="all" onSelect={handleTabSelect}>
            <Nav.Item>
              <Nav.Link eventKey="all">Todos</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="GEN">Anuncios Generales</Nav.Link> {/* Usar el nombre de la constante del enum */}
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="CAR">Anuncios de Carrera</Nav.Link> {/* Usar el nombre de la constante del enum */}
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="DEP">Anuncios de Departamento</Nav.Link> {/* Usar el nombre de la constante del enum */}
            </Nav.Item>
            {/* Si tu enum TipoAnuncio en Java tiene otras constantes como EVENTO o WEBINAR, actívalas aquí */}
            {/* <Nav.Item><Nav.Link eventKey="EVENTO">Eventos</Nav.Link></Nav.Item> */}
            {/* <Nav.Item><Nav.Link eventKey="WEBINAR">Webinars</Nav.Link></Nav.Item> */}
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
                      <td>{pub.fechaCreacion ? new Date(pub.fechaCreacion).toLocaleDateString() : 'N/A'}</td> {/* 'fechaCreacion' de tu backend */}
                      <td>{pub.autor ? pub.autor.name : 'N/A'}</td> {/* Acceder a la propiedad 'name' del objeto 'autor' */}
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