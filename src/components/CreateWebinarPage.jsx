// src/components/CreateWebinarPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const API_URL_WEBINARS = 'http://localhost:8080/api/webinars'; // Asegúrate de que esta sea la URL correcta para tu API de webinars

function CreateWebinarPage() {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [expositor, setExpositor] = useState('');
    const [enlace, setEnlace] = useState('');
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

        const newWebinar = {
            titulo,
            descripcion,
            fecha, // Asegúrate de que el formato de fecha sea el esperado por tu backend
            expositor,
            enlace
        };

        try {
            await axios.post(API_URL_WEBINARS, newWebinar, { headers: getAuthHeaders() });
            setSuccess(true);
            alert('Webinar creado con éxito!');
            navigate('/webinars'); // Redirige al listado de webinars
        } catch (err) {
            console.error('Error al crear el webinar:', err);
            setError('No se pudo crear el webinar. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            }
        }
    };

    return (
        <Container className="mt-4">
            <h1>Crear Nuevo Webinar</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Webinar creado exitosamente.</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                        type="datetime-local" // O 'date' si solo necesitas la fecha
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Expositor</Form.Label>
                    <Form.Control
                        type="text"
                        value={expositor}
                        onChange={(e) => setExpositor(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Enlace</Form.Label>
                    <Form.Control
                        type="url"
                        value={enlace}
                        onChange={(e) => setEnlace(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Crear Webinar
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/webinars')}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
}

export default CreateWebinarPage;