import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 


const BASE_URL = 'http://localhost:8080'; 
function CreateEventoPage() {
    const navigate = useNavigate();
    const [eventoData, setEventoData] = useState({
        capacidad: '',
        descripcion: '',
        fecha_fin: '',
        fecha_inicio: '',
        titulo: '',
        ubicacion: '',
        imagen: '', 
        autor_id: '', 
        carrera_id: '' 
    });
    const [file, setFile] = useState(null); 
    const [previewImage, setPreviewImage] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [carreras, setCarreras] = useState([]);
    const [authors, setAuthors] = useState([]); 

    useEffect(() => {
        setCarreras([
            { id: 1, nombre: 'Software' },
            { id: 2, nombre: 'Mecatrónica' },
            { id: 3, nombre: 'Redes' },
        ]);
        
        setEventoData(prev => ({ ...prev, autor_id: 1 })); 
        setAuthors([ 
            { id: 1, nombre: 'Usuario Administrador' },
            { id: 2, nombre: 'Otro Autor' }
        ]);

    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventoData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreviewImage(URL.createObjectURL(selectedFile));
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        let imageUrl = eventoData.imagen;

        if (file) {
            const formData = new FormData();
            formData.append('file', file); // 'file' debe coincidir con el @RequestParam en tu UploadController

            try {
                // Asegúrate de que esta URL sea el endpoint de tu controlador de subida de archivos (UploadController)
                const uploadResponse = await axios.post(`${BASE_URL}/api/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Envía el token JWT
                    }
                });
                imageUrl = uploadResponse.data;
                setEventoData(prev => ({ ...prev, imagen: imageUrl }));
                console.log('Imagen subida exitosamente:', imageUrl);
            } catch (err) {
                console.error('Error al subir la imagen:', err.response ? err.response.data : err.message);
                setError('Error al subir la imagen: ' + (err.response ? err.response.data.message || err.response.statusText : err.message));
                setLoading(false);
                return; // Detiene la ejecución si falla la subida de imagen
            }
        }

        try {
            const finalEventoData = { ...eventoData, imagen: imageUrl };
            // Asegúrate de que esta URL sea el endpoint para crear eventos en tu EventoController
            const createResponse = await axios.post('http://localhost:8080/api/eventos', finalEventoData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Envía el token JWT
                }
            });
            setSuccess(true);
            console.log('Evento creado exitosamente:', createResponse.data);
    
            navigate('/eventos'); // Redirige a la página de listado de eventos
        } catch (err) {
            console.error('Error al crear el evento:', err.response ? err.response.data : err.message);
            setError('Error al crear el evento: ' + (err.response ? err.response.data.message || err.response.statusText : err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-4">
            <h2 className="mb-4">Crear Nuevo Evento</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Evento creado exitosamente.</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="titulo">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="titulo"
                                value={eventoData.titulo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="capacidad">
                            <Form.Label>Capacidad</Form.Label>
                            <Form.Control
                                type="number"
                                name="capacidad"
                                value={eventoData.capacidad}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3" controlId="descripcion">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="descripcion"
                        value={eventoData.descripcion}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="fecha_inicio">
                            <Form.Label>Fecha de Inicio</Form.Label>
                            <Form.Control
                                type="datetime-local" // Usamos datetime-local para fecha y hora
                                name="fecha_inicio"
                                value={eventoData.fecha_inicio}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="fecha_fin">
                            <Form.Label>Fecha de Fin</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="fecha_fin"
                                value={eventoData.fecha_fin}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3" controlId="ubicacion">
                    <Form.Label>Ubicación</Form.Label>
                    <Form.Control
                        type="text"
                        name="ubicacion"
                        value={eventoData.ubicacion}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="carrera_id">
                    <Form.Label>Carrera Asociada</Form.Label>
                    <Form.Select
                        name="carrera_id"
                        value={eventoData.carrera_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona una carrera</option>
                        {carreras.map(carrera => (
                            <option key={carrera.id} value={carrera.id}>
                                {carrera.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Si tu autor_id es un campo seleccionable en el formulario */}
                <Form.Group className="mb-3" controlId="autor_id">
                    <Form.Label>Autor del Evento</Form.Label>
                    <Form.Select
                        name="autor_id"
                        value={eventoData.autor_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un autor</option>
                        {authors.map(author => (
                            <option key={author.id} value={author.id}>
                                {author.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>


                <Form.Group className="mb-3" controlId="imagen">
                    <Form.Label>Imagen del Evento</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {previewImage && (
                        <div className="mt-2">
                            <img src={previewImage} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Evento'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/eventos')} className="ms-2">
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
}

export default CreateEventoPage;