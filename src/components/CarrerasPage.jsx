import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { Container, Row, Col, Table, Alert, InputGroup, FormControl } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const API_URL_CARRERAS = 'http://localhost:8080/api/carreras';

function CarrerasPage() {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); 

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchCarreras = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_CARRERAS, { headers: getAuthHeaders() });
            setCarreras(response.data);
        } catch (err) {
            console.error('Error al cargar las carreras:', err);
            setError('No se pudieron cargar las carreras. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login'); // Redirige al login si no está autorizado
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para ver las carreras.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarreras();
    }, []);

    const filteredCarreras = carreras.filter(carrera =>
        carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (carrera.codigo && carrera.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (carrera.descripcion && carrera.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando carreras...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <Container fluid className="carreras-page-container mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1>Listado de Carreras</h1>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por nombre, código o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="table-responsive">
                        <Table striped bordered hover className="carreras-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCarreras.length > 0 ? (
                                    filteredCarreras.map((carrera) => (
                                        <tr key={carrera.id}>
                                            <td>{carrera.id}</td>
                                            <td>{carrera.codigo}</td>
                                            <td>{carrera.nombre}</td>
                                            <td>{carrera.descripcion}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No se encontraron carreras.</td>
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

export default CarrerasPage;