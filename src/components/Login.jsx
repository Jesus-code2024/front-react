import React, { useState } from 'react';
import { FaGoogle, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EmailLoginForm from './EmailLoginForm';

import { Navbar, Container } from 'react-bootstrap';


import tecsupLogoHeader from '../assets/Tecsup-sinbackground.png'; 
import tecsupLogoMain from '../assets/logo-tec.png'; 

function AuthPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {


        const frontendRedirectUri = 'http://localhost:3000/oauth2/redirect'; 
        
  
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
              src={tecsupLogoHeader} 
              alt="Tecsup Eventos Logo"
              className="header-logo-image" 
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