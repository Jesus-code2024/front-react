import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token'); 
        const error = queryParams.get('error'); 

        if (token) {
            localStorage.setItem('jwtToken', token); 
            console.log('Autenticación Google exitosa. JWT recibido y guardado.'); // Añadido log para confirmar
            navigate('/dashboard', { replace: true }); 
        } else if (error) {
            console.error('Autenticación Google fallida:', error);
            alert(`Error al iniciar sesión con Google: ${error}`); 
            navigate('/login', { replace: true }); 
        } else {
            console.warn('Redirección OAuth2 sin token ni error.');
            navigate('/login', { replace: true }); 
        }
    }, [location, navigate]);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Procesando inicio de sesión con Google...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;