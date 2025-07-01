import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import MainNavbar from './components/MainNavbar'; 
import AuthPage from './components/Login'; 
import PublicationsPage from './components/PublicationsPage'; // Corregido: PublicactionPage -> PublicationsPage
import CreatePublicationPage from './components/CreatePublicationPage'; 

// Importación de los componentes de listado
import CarrerasPage from './components/CarrerasPage';
import DepartamentosPage from './components/DepartamentosPage';
import EventosPage from './components/EventosPage';
import WebinarsPage from './components/WebinarsPage';


// Este es tu OAuth2RedirectHandler, ahora con la redirección a /dashboard y guardando 'jwtToken'
const OAuth2RedirectHandler = () => {
    const location = useLocation(); 
    const navigate = useNavigate();   

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token'); 
        const error = urlParams.get('error'); 

        if (token) {
            localStorage.setItem('jwtToken', token); // Guarda el token con la clave 'jwtToken'
            console.log('OAuth2RedirectHandler: Token JWT recibido y guardado exitosamente.'); 
            window.dispatchEvent(new Event('storage')); 
            navigate('/dashboard', { replace: true });
        } else if (error) {
            console.error("OAuth2RedirectHandler: Error en el proceso de autenticación OAuth2:", error);
            navigate('/login', { state: { error: "Error de autenticación: " + error }, replace: true });
        } else {
            console.warn("OAuth2RedirectHandler: Redirección de OAuth2 sin token ni error aparente.");
            navigate('/login', { replace: true });
        }
    }, [location, navigate]); 

    return (
        <div style={{ textAlign: 'center', padding: '50px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
            <h2>Procesando autenticación...</h2>
            <p>Por favor, espere.</p>
        </div>
    );
};

function App() {
    // Define un estado para controlar la autenticación
    const [authenticatedUser, setAuthenticatedUser] = useState(() => {
        // Inicializa el estado leyendo de localStorage al cargar la app
        const token = localStorage.getItem('jwtToken');
        return token !== null && token.length > 0;
    });

    // Función para actualizar el estado cuando el token cambia en localStorage
    const handleStorageChange = () => {
        const token = localStorage.getItem('jwtToken');
        const isCurrentlyAuthenticated = token !== null && token.length > 0;
        if (isCurrentlyAuthenticated !== authenticatedUser) {
            setAuthenticatedUser(isCurrentlyAuthenticated);
            console.log("App.jsx: Estado de autenticación actualizado a:", isCurrentlyAuthenticated);
        }
    };

    // Agrega un event listener para los cambios en localStorage
    useEffect(() => {
        window.addEventListener('storage', handleStorageChange);
        // Limpia el event listener al desmontar el componente
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [authenticatedUser]); // Asegúrate de re-evaluar si el estado cambia

    // isAuthenticated ahora solo devuelve el estado
    const isAuthenticated = () => authenticatedUser;

    // Componente de protección de ruta para simplificar el código
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Router>
            {/* El Navbar se muestra condicionalmente solo si el usuario está autenticado */}
            {isAuthenticated() && <MainNavbar />}

            <Routes>
                {/* Ruta de Login/Registro */}
                {/* Si ya está autenticado, lo redirige al dashboard en lugar de mostrar la página de login */}
                <Route
                    path="/login"
                    element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <AuthPage />}
                />

                {/* Ruta principal del dashboard/publicaciones */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PublicationsPage /> 
                        </ProtectedRoute>
                    }
                />
                
                {/* Ruta para el manejo de la redirección de OAuth2 (después de la autenticación de Google) */}
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                {/* Rutas para la gestión de Publicaciones */}
                <Route
                    path="/publications"
                    element={
                        <ProtectedRoute>
                            <PublicationsPage /> {/* Esta ruta muestra la misma página que /dashboard por ahora */}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/publications/new"
                    element={
                        <ProtectedRoute>
                            <CreatePublicationPage />
                        </ProtectedRoute>
                    }
                />
                {/* Ejemplo de ruta para editar (puedes crear un EditPublicationPage.jsx) */}
                <Route
                    path="/publications/edit/:id"
                    element={
                        <ProtectedRoute>
                            {/* Este div es temporal. Deberías crear un componente EditPublicationPage */}
                            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                                <h2>Página para editar publicación</h2>
                                <p>Editando publicación con ID: <strong>{useParams().id}</strong></p> 
                                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
                            </div>
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/publications/:id"
                    element={
                        <ProtectedRoute>
                             {/* Este div es temporal. Deberías crear un componente PublicationDetailsPage */}
                            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                                <h2>Detalles de la Publicación</h2>
                                <p>Mostrando detalles de publicación con ID: <strong>{useParams().id}</strong></p>
                                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
                            </div>
                        </ProtectedRoute>
                    }
                />


                {/* Rutas para Carreras */}
                <Route
                    path="/carreras"
                    element={
                        <ProtectedRoute>
                            <CarrerasPage />
                        </ProtectedRoute>
                    }
                />
            

                {/* Rutas para Departamentos */}
                <Route
                    path="/departamentos"
                    element={
                        <ProtectedRoute>
                            <DepartamentosPage />
                        </ProtectedRoute>
                    }
                />
                {/* Rutas para Eventos */}
                <Route
                    path="/eventos"
                    element={
                        <ProtectedRoute>
                            <EventosPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas para Webinars */}
                <Route
                    path="/webinars"
                    element={
                        <ProtectedRoute>
                            <WebinarsPage />
                        </ProtectedRoute>
                    }
                />
                {/* Ruta comodín (catch-all) para cualquier URL no definida */}
                {/* Redirige a /dashboard si está autenticado, de lo contrario a /login */}
                <Route
                    path="*" 
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