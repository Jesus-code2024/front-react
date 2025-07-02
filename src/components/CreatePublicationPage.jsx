// src/components/CreatePublicationPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// URL base de tu backend de Spring Boot para los anuncios/publicaciones
const API_URL_PUBLICACIONES = 'http://localhost:8080/api/anuncios';

function CreatePublicationPage() {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [tipo, setTipo] = useState('GEN');
    const [carreraId, setCarreraId] = useState('');
    const [departamentoId, setDepartamentoId] = useState('');
    
    const [fechaPublicacion, setFechaPublicacion] = useState(new Date().toISOString().slice(0, 16)); // Valor por defecto: fecha y hora actual en formato YYYY-MM-DDTHH:MM
    const [autorNombre, setAutorNombre] = useState(''); // Asume que el usuario introduce el nombre

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Construye el objeto de la nueva publicación con los datos del formulario, incluyendo fecha y autor
        const newPublication = {
            titulo,
            contenido,
            tipo,
            fechaPublicacion: fechaPublicacion + ':00', // Agrega segundos si tu backend lo espera (YYYY-MM-DDTHH:MM:SS)
            autorNombre, // Envía el nombre del autor ingresado
            ...(tipo === 'CAR' && { carreraId: parseInt(carreraId) }),
            ...(tipo === 'DEP' && { departamentoId: parseInt(departamentoId) }),
        };

        try {
            await axios.post(API_URL_PUBLICACIONES, newPublication, { headers: getAuthHeaders() });
            setSuccess(true);
            // Limpiar el formulario
            setTitulo('');
            setContenido('');
            setTipo('GEN');
            setCarreraId('');
            setDepartamentoId('');
            setFechaPublicacion(new Date().toISOString().slice(0, 16)); // Resetear a la fecha actual
            setAutorNombre('');
            
            navigate('/dashboard'); 
        } catch (err) {
            console.error('Error al crear publicación:', err.response || err);
            if (err.response && err.response.status === 401) {
                setError('No autorizado. Por favor, inicie sesión de nuevo.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para crear publicaciones.');
            } else {
                setError('Error al crear la publicación. Intente de nuevo.');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h2>Crear Nueva Publicación</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Publicación creada exitosamente. Redirigiendo...</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitulo">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el título"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formContenido">
                    <Form.Label>Contenido / Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ingrese el contenido o descripción de la publicación"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaPublicacion">
                    <Form.Label>Fecha de Publicación</Form.Label>
                    <Form.Control
                        type="datetime-local" // Este tipo de input permite seleccionar fecha y hora
                        value={fechaPublicacion}
                        onChange={(e) => setFechaPublicacion(e.target.value)}
                        required
                    />
                </Form.Group>

                {/* **NUEVO CAMPO: AUTOR** */}
                <Form.Group className="mb-3" controlId="formAutor">
                    <Form.Label>Autor</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre del autor"
                        value={autorNombre}
                        onChange={(e) => setAutorNombre(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTipo">
                    <Form.Label>Tipo de Publicación</Form.Label>
                    <Form.Control
                        as="select"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="GEN">Anuncio General</option>
                        <option value="CAR">Anuncio de Carrera</option>
                        <option value="DEP">Anuncio de Departamento</option>
                    </Form.Control>
                </Form.Group>

                {tipo === 'CAR' && (
                    <Form.Group className="mb-3" controlId="formCarrera">
                        <Form.Label>ID de Carrera</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Ingrese el ID de la carrera"
                            value={carreraId}
                            onChange={(e) => setCarreraId(e.target.value)}
                            required={tipo === 'CAR'}
                        />
                    </Form.Group>
                )}

                {tipo === 'DEP' && (
                    <Form.Group className="mb-3" controlId="formDepartamento">
                        <Form.Label>ID de Departamento</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Ingrese el ID del departamento"
                            value={departamentoId}
                            onChange={(e) => setDepartamentoId(e.target.value)}
                            required={tipo === 'DEP'}
                        />
                    </Form.Group>
                )}

                <Button variant="primary" type="submit" className="me-2">
                    Crear Publicación
                </Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
}

export default CreatePublicationPage;