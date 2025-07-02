// src/components/EditWebinarPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const API_URL_WEBINARS = 'http://localhost:8080/api/webinars'; // Asegúrate de que esta sea la URL correcta para tu API de webinars

function EditWebinarPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [webinar, setWebinar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                const response = await axios.get(`${API_URL_WEBINARS}/${id}`, { headers: getAuthHeaders() });
                setWebinar(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error al cargar el webinar para edición:', err);
                setError('No se pudo cargar el webinar para edición. Por favor, verifique el ID.');
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        };
        fetchWebinar();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWebinar(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.put(`${API_URL_WEBINARS}/${id}`, webinar, { headers: getAuthHeaders() });
            alert('Webinar actualizado con éxito!');
            navigate('/webinars'); // Redirige al listado de webinars
        } catch (err) {
            console.error('Error al actualizar el webinar:', err);
            setError('No se pudo actualizar el webinar. Por favor, intente de nuevo.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permiso para editar este webinar (solo el autor puede).');
            }
        }
    };

    if (loading) return <p>Cargando webinar...</p>;
    if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;
    if (!webinar) return <Alert variant="info" className="text-center">Webinar no encontrado.</Alert>;

    return (
        <Container className="mt-4">
            <h1>Editar Webinar</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                        type="text"
                        name="titulo"
                        value={webinar.titulo || ''}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="descripcion"
                        value={webinar.descripcion || ''}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="fecha"
                        value={webinar.fecha ? new Date(webinar.fecha).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Expositor</Form.Label>
                    <Form.Control
                        type="text"
                        name="expositor"
                        value={webinar.expositor || ''}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Enlace</Form.Label>
                    <Form.Control
                        type="url"
                        name="enlace"
                        value={webinar.enlace || ''}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Guardar Cambios
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/webinars')}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
}

export default EditWebinarPage;