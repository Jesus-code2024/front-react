import React, { useState } from 'react';
import { FaGoogle, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EmailLoginForm from './EmailLoginForm';

import { Navbar, Container } from 'react-bootstrap';


import tecsupLogoHeader from '../assets/Tecsup-sinbackground.png'; // <--- Logo para el header (sin fondo)'
import tecsupLogoMain from '../assets/logo-tec.png';  // <--- Logo para la sección principal (el grande del medio)

function AuthPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
        // *** CAMBIO CLAVE AQUÍ ***
        // La URL de autorización de Spring Security OAuth2 Client es:
        // http://localhost:8080/oauth2/authorize/{registrationId}
        // Donde {registrationId} es 'google' en tu caso.
        // El parámetro 'redirect_uri' que le pasamos es la URL de nuestro frontend
        // a la que el backend redirigirá después de procesar la autenticación de Google.

        // Define la URL de tu frontend a la que el backend debe redirigir
        const frontendRedirectUri = 'http://localhost:3000/oauth2/redirect'; // ASEGÚRATE QUE ESTA ES LA URL EXACTA DE TU FRONTEND
        
        // Construye la URL de inicio del flujo OAuth2 en tu backend
        // Spring Security usará su configuración interna para Google.
        // Nota: no se usa "authorization/google" directamente en la baseUri,
        // sino "authorize/google" al final.
        const authorizationUrl = `http://localhost:8080/oauth2/authorize/google?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`;

        // Redirige el navegador a la URL construida
        window.location.href = authorizationUrl;
  };

  const handleEmailLoginClick = () => {
    setShowEmailForm(true);
  };

  const handleBackToOptions = () => {
    setShowEmailForm(false);
  };

  return (
    <div className="auth-page-container">
      <Navbar className="auth-header-custom">
        <Container fluid>
          <Navbar.Brand href="/"> 
            <img
              src={tecsupLogoHeader} // Usamos el logo para el header
              alt="Tecsup Eventos Logo"
              className="header-logo-image" // Clase para controlar el tamaño en CSS
            />
          </Navbar.Brand>
        </Container>
      </Navbar>

      <div className="auth-content">
        {!showEmailForm ? (
          <>
            <img src={tecsupLogoMain} alt="Logo Tecsup" className="illustration main-illustration" />
            <h2>Inicia sesión para continuar</h2>

            <div className="auth-buttons">
              <button className="social-button google-button large-social-button" onClick={handleGoogleLogin}>
                <FaGoogle className="icon" />
                Continúa con Google
              </button>

              <button className="social-button email-button large-social-button" onClick={handleEmailLoginClick}>
                <FaEnvelope className="icon" />
                Continúa con tu email
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="back-button" onClick={handleBackToOptions}>
              &larr; Volver
            </button>
            <EmailLoginForm />
          </>
        )}
      </div>
    </div>
  );
}

export default AuthPage;