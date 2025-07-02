import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Importa useParams
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';

const API_URL_EVENTOS = 'http://localhost:8080/api/eventos';
const API_URL_UPLOAD = 'http://localhost:8080/api/upload';
const API_URL_CARRERAS = 'http://localhost:8080/api/carreras'; // Asumo esta URL para carreras
const API_URL_USUARIOS = 'http://localhost:8080/api/users'; // Asumo esta URL para usuarios

function EditEventoPage() {
    const { id } = useParams(); // Obtiene el ID del evento de la URL
    const navigate = useNavigate();

    const [evento, setEvento] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        ubicacion: '',
        capacidad: '',
        carrera_id: '',
        autor_id: '',
        imagen: '' // Para la URL de la imagen existente
    });
    const [selectedFile, setSelectedFile] = useState(null); // Para la nueva imagen a subir
    const [carreras, setCarreras] = useState([]);
    const [usuarios, setUsuarios] = useState([]); // Para la lista de usuarios/autores
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Evento Data
                const eventoResponse = await axios.get(`${API_URL_EVENTOS}/${id}`, { headers: getAuthHeaders() });
                const fetchedEvento = eventoResponse.data;

                // Formatear fechas para el input datetime-local
                fetchedEvento.fecha_inicio = fetchedEvento.fechaInicio ? new Date(fetchedEvento.fechaInicio).toISOString().slice(0, 16) : '';
                fetchedEvento.fecha_fin = fetchedEvento.fechaFin ? new Date(fetchedEvento.fechaFin).toISOString().slice(0, 16) : '';
                
                // Asegúrate de usar los nombres de propiedades correctos (fechaInicio, fechaFin si tu backend los devuelve así)
                // O si tu backend devuelve fecha_inicio y fecha_fin, el formato original está bien.
                // Ajustamos por si acaso para manejar ambos
                fetchedEvento.fecha_inicio = fetchedEvento.fecha_inicio || (fetchedEvento.fechaInicio ? new Date(fetchedEvento.fechaInicio).toISOString().slice(0, 16) : '');
                fetchedEvento.fecha_fin = fetchedEvento.fecha_fin || (fetchedEvento.fechaFin ? new Date(fetchedEvento.fechaFin).toISOString().slice(0, 16) : '');


                // Asegúrate de que los IDs existan y sean números
                fetchedEvento.carrera_id = fetchedEvento.carrera ? fetchedEvento.carrera.id : '';
                fetchedEvento.autor_id = fetchedEvento.autor ? fetchedEvento.autor.id : '';

                setEvento(fetchedEvento);

                // Fetch Carreras
                const carrerasResponse = await axios.get(API_URL_CARRERAS, { headers: getAuthHeaders() });
                setCarreras(carrerasResponse.data);

                // Fetch Usuarios (Autores) - Opcional, solo si quieres un dropdown para el autor
                const usersResponse = await axios.get(API_URL_USUARIOS, { headers: getAuthHeaders() });
                setUsuarios(usersResponse.data);

            } catch (err) {
                console.error('Error al cargar datos para edición:', err);
                setError('No se pudieron cargar los datos del evento. Intente de nuevo o verifique el ID.');
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]); // Dependencia del ID para recargar si cambia

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvento(prevEvento => ({ ...prevEvento, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        let imageUrl = evento.imagen; // Mantener la imagen existente por defecto

        try {
            // Si hay un nuevo archivo seleccionado, subirlo primero
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadResponse = await axios.post(API_URL_UPLOAD, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...getAuthHeaders() // Asegúrate de enviar los headers de auth también para la subida
                    },
                });
                imageUrl = uploadResponse.data.url; // Obtener la URL de la imagen subida
                console.log('Imagen subida exitosamente:', imageUrl);
            }

            // Preparar los datos del evento para enviar
            const finalEventoData = {
                ...evento,
                imagen: imageUrl,
                // Asegúrate de que los IDs sean números si tu backend los espera así
                carrera_id: evento.carrera_id ? parseInt(evento.carrera_id) : null,
                autor_id: evento.autor_id ? parseInt(evento.autor_id) : null,
                // Asegúrate de que las fechas sean enviadas en el formato correcto (ISO string o lo que espere tu backend)
                fecha_inicio: evento.fecha_inicio ? new Date(evento.fecha_inicio).toISOString() : null,
                fecha_fin: evento.fecha_fin ? new Date(evento.fecha_fin).toISOString() : null
            };

            // Eliminar campos que el backend no espera directamente en el objeto Evento
            delete finalEventoData.carrera; // Si carrera_id ya es suficiente
            delete finalEventoData.autor; // Si autor_id ya es suficiente
            delete finalEventoData.id; // No envíes el ID en el cuerpo para un PUT

            // Enviar la solicitud de actualización
            const response = await axios.put(`${API_URL_EVENTOS}/${id}`, finalEventoData, { headers: getAuthHeaders() });
            setSuccessMessage('Evento actualizado exitosamente.');
            console.log('Evento actualizado:', response.data);
            navigate('/eventos'); // Redirige de vuelta a la lista de eventos
            
        } catch (err) {
            console.error('Error al actualizar el evento:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Error: ${err.response.data.message}`);
            } else {
                setError('Hubo un error al actualizar el evento. Intente de nuevo.');
            }
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                 setError('No tienes permiso para editar este evento. Solo el autor puede.');
            }
        }
    };

    if (loading) return <p className="text-center mt-5">Cargando datos del evento...</p>;
    if (error && !successMessage) return <Alert variant="danger" className="text-center mt-5">{error}</Alert>;

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h2 className="text-center mb-4">Editar Evento</h2>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="titulo"
                                value={evento.titulo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                value={evento.descripcion}
                                onChange={handleChange}
                                rows={3}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Inicio</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="fecha_inicio"
                                        value={evento.fecha_inicio}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Fin</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="fecha_fin"
                                        value={evento.fecha_fin}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Ubicación</Form.Label>
                            <Form.Control
                                type="text"
                                name="ubicacion"
                                value={evento.ubicacion}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Capacidad</Form.Label>
                            <Form.Control
                                type="number"
                                name="capacidad"
                                value={evento.capacidad}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {/* Dropdown para Carrera */}
                        <Form.Group className="mb-3">
                            <Form.Label>Carrera Asociada</Form.Label>
                            <Form.Select
                                name="carrera_id"
                                value={evento.carrera_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione una carrera</option>
                                {carreras.map(carrera => (
                                    <option key={carrera.id} value={carrera.id}>
                                        {carrera.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Dropdown para Autor del Evento (Usuario) */}
                        <Form.Group className="mb-3">
                            <Form.Label>Autor del Evento</Form.Label>
                            <Form.Select
                                name="autor_id"
                                value={evento.autor_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un autor</option>
                                {usuarios.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Imagen del Evento</Form.Label>
                            {evento.imagen && (
                                <div className="mb-2">
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={evento.imagen.startsWith('http://') || evento.imagen.startsWith('https://')
                                                ? evento.imagen
                                                : `http://localhost:8080${evento.imagen}`} // Ajusta BASE_URL si es necesario
                                        alt="Current Event" 
                                        style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd' }} 
                                    />
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Seleccione un archivo para cambiar la imagen. Si no selecciona, se mantendrá la actual.
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 mt-3">
                            Actualizar Evento
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/eventos')} className="w-100 mt-2">
                            Cancelar
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default EditEventoPage;