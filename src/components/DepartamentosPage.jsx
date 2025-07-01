import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, InputGroup, FormControl } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const API_URL_DEPARTAMENTOS = 'http://localhost:8080/api/departamentos';

function DepartamentosPage() {
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchDepartamentos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_DEPARTAMENTOS, { headers: getAuthHeaders() });
            setDepartamentos(response.data);
        } catch (err) {
            console.error('Error al cargar los departamentos:', err);
            setError('No se pudieron cargar los departamentos. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para ver los departamentos.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    const filteredDepartamentos = departamentos.filter(departamento =>
        departamento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (departamento.codigo && departamento.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (departamento.responsable && departamento.responsable.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando departamentos...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <Container fluid className="departamentos-page-container mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1>Listado de Departamentos</h1>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar por nombre, código o responsable..."
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
                        <Table striped bordered hover className="departamentos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Responsable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDepartamentos.length > 0 ? (
                                    filteredDepartamentos.map((departamento) => (
                                        <tr key={departamento.id}>
                                            <td>{departamento.id}</td>
                                            <td>{departamento.codigo}</td>
                                            <td>{departamento.nombre}</td>
                                            <td>{departamento.responsable || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No se encontraron departamentos.</td>
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

export default DepartamentosPage;