import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  Outlet
} from 'react-router-dom';
import MainNavbar from './components/MainNavbar';
import AuthPage from './components/Login';
import PublicationsPage from './components/PublicationsPage';
import CreatePublicationPage from './components/CreatePublicationPage';
import HomePage from './components/HomePage';
import CarrerasPage from './components/CarrerasPage';
import DepartamentosPage from './components/DepartamentosPage';
import EventosPage from './components/EventosPage';
import WebinarsPage from './components/WebinarPage';
import CreateEventoPage from './components/CreateEventoPage';
import EditEventoPage from './components/EditEventoPage';
import CreateWebinarPage from './components/CreateWebinarPage';
import EditWebinarPage from './components/EditWebinarPage';
import Footer from './components/Footer'; 
import DetalleItemPage from './components/DetalleItemPage';


const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('jwtToken', token);
      window.dispatchEvent(new Event('storage'));
      navigate('/home', { replace: true });
    } else if (error) {
      navigate('/login', {
        state: { error: 'Error de autenticación: ' + error },
        replace: true,
      });
    } else {
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

// 🛡️ Ruta protegida con navbar
const ProtectedRoute = () => {
  const token = localStorage.getItem('jwtToken');
  const isAuthenticated = token && token.length > 0;

  return isAuthenticated ? (
    <>
      <MainNavbar />
      {/* Contenedor para el contenido principal y para empujar el footer hacia abajo */}
      <div className="main-content" style={{ minHeight: 'calc(100vh - 120px)' }}> {/* Ajusta 120px a la altura combinada de tu navbar y footer */}
        <Outlet />
      </div>
      <Footer /> {/* <-- Mueve el Footer aquí dentro de ProtectedRoute */}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    return token !== null && token.length > 0;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('jwtToken');
      const isAuth = token && token.length > 0;
      setAuthenticatedUser(isAuth);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = () => authenticatedUser;

  return (
    <Router>
      <Routes>
        {/* 👤 Página de login */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/home" replace /> : <AuthPage />}
        />

        {/* 🌀 Ruta de redirección OAuth2 */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* 🔒 TODAS LAS RUTAS PROTEGIDAS VAN AQUI DENTRO */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />

          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/publications/new" element={<CreatePublicationPage />} />
          <Route
            path="/publications/edit/:id"
            element={
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                <h2>Página para editar publicación</h2>
                <p>Editando publicación con ID: <strong>{useParams().id}</strong></p>
                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
              </div>
            }
          />
          <Route
            path="/publications/:id"
            element={
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 71px)' }}>
                <h2>Detalles de la Publicación</h2>
                <p>Mostrando detalles de publicación con ID: <strong>{useParams().id}</strong></p>
                <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
              </div>
            }
          />

          <Route path="/carreras" element={<CarrerasPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/evento/new" element={<CreateEventoPage />} />
          <Route path="/edit-evento/:id" element={<EditEventoPage />} />
          <Route path="/webinar/new" element={<CreateWebinarPage />} />
          <Route path="/edit-webinar/:id" element={<EditWebinarPage />} />
          <Route path="/eventos/:id" element={<DetalleItemPage />} />
          <Route path="/webinars/:id" element={<DetalleItemPage />} />




          {/* 🌐 Ruta comodín protegida */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
