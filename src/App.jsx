// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import MainNavbar from './components/MainNavbar'; // Tu Navbar principal para usuarios autenticados
import AuthPage from './components/AuthPage'; // <--- RUTA CORREGIDA: Ahora apunta a src/components/AuthPage.jsx
import PublicationsPage from './components/PublicationsPage'; // Tu página principal de listado de publicaciones

/**
 * Componente para manejar la redirección después de la autenticación OAuth2 (ej. Google).
 * Captura el token JWT de la URL y lo guarda en localStorage.
 */
const OAuth2RedirectHandler = () => {
  const location = useLocation(); // Hook para acceder a la URL actual
  const navigate = useNavigate(); // Hook para la navegación programática

  useEffect(() => {
    // Analiza los parámetros de la URL (query parameters)
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token'); // Intenta obtener el parámetro 'token'
    const error = urlParams.get('error'); // Intenta obtener el parámetro 'error' (en caso de fallo)

    if (token) {
      // Si se encuentra un token, guárdalo en localStorage
      localStorage.setItem('token', token);
      console.log("OAuth2RedirectHandler: Token JWT recibido y guardado exitosamente.");
      // Redirige al dashboard, reemplazando la entrada actual en el historial para evitar volver aquí con el botón "atrás"
      navigate('/dashboard', { replace: true });
    } else if (error) {
      // Si hay un error, imprímelo en consola y redirige al login con el mensaje de error
      console.error("OAuth2RedirectHandler: Error en el proceso de autenticación OAuth2:", error);
      navigate('/login', { state: { error: "Error de autenticación: " + error }, replace: true });
    } else {
      // Si no hay token ni error (situación inesperada), redirige al login
      console.warn("OAuth2RedirectHandler: Redirección de OAuth2 sin token ni error aparente.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]); // Las dependencias aseguran que el efecto se re-ejecute si la URL o la función navigate cambian

  // Mientras se procesa la autenticación, muestra un mensaje de carga
  return (
    <div style={{ textAlign: 'center', padding: '50px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <h2>Procesando autenticación...</h2>
      <p>Por favor, espere. Si no es redirigido automáticamente, puede haber un problema.</p>
    </div>
  );
};

/**
 * Componente principal de la aplicación.
 * Define las rutas y la lógica de protección de rutas basada en la autenticación.
 */
function App() {
  /**
   * Verifica si el usuario está autenticado comprobando la existencia de un token en localStorage.
   * @returns {boolean} True si el token existe y no está vacío, false en caso contrario.
   */
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    // Considera que un token debe ser un string no vacío para ser válido
    return token !== null && token.length > 0;
  };

  return (
    <Router>
      {/* Condicionalmente renderiza el Navbar principal si el usuario está autenticado */}
      {isAuthenticated() && <MainNavbar />}

      {/* Definición de todas las rutas de la aplicación */}
      <Routes>
        {/* Ruta para la página de login/registro */}
        {/* Si el usuario ya está autenticado e intenta acceder a /login, es redirigido a /dashboard */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />

        {/* Ruta principal de la aplicación (dashboard/publicaciones) */}
        {/* Esta ruta está protegida: si el usuario no está autenticado, es redirigido a /login */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? (
              <PublicationsPage /> // Muestra la página de publicaciones si está autenticado
            ) : (
              <Navigate to="/login" replace /> // Redirige al login si no está autenticado
            )
          }
        />

        {/* Ruta para manejar el callback de OAuth2 después del inicio de sesión de Google */}
        {/* Esta ruta es crucial para que el frontend capture el token del backend */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Rutas adicionales para la gestión de publicaciones (ejemplos) */}
        {/* Estas rutas también están protegidas */}

        {/* Página para crear una nueva publicación */}
        <Route
          path="/publications/new"
          element={
            isAuthenticated() ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                <h2>Página para crear nueva publicación</h2>
                <p>Aquí iría tu componente `CreatePublicationPage` con un formulario para crear publicaciones.</p>
                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Página para editar una publicación existente (con un ID dinámico) */}
        <Route
          path="/publications/edit/:id"
          element={
            isAuthenticated() ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                <h2>Página para editar publicación</h2>
                <p>Editando publicación con ID: <strong>{useParams().id}</strong></p> {/* useParams() para obtener el ID de la URL */}
                <p>Aquí iría tu componente `EditPublicationPage` con un formulario pre-llenado.</p>
                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Página para ver los detalles de una publicación específica (con un ID dinámico) */}
        <Route
          path="/publications/:id"
          element={
            isAuthenticated() ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                <h2>Detalles de la Publicación</h2>
                <p>Mostrando detalles de publicación con ID: <strong>{useParams().id}</strong></p>
                <p>Aquí iría tu componente `PublicationDetailPage` para mostrar la información completa.</p>
                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta por defecto (catch-all): maneja cualquier otra URL no definida */}
        {/* Si el usuario está autenticado, lo redirige al dashboard. Si no, al login. */}
        <Route
          path="*" // Coincide con cualquier ruta no definida previamente
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;