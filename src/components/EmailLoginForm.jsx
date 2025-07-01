// src/auth/EmailLoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/AuthService';

function EmailLoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ usernameOrEmail, password });

      // ✅ Marca sesión con correo o token
      if (response.token) {
        localStorage.setItem('token', response.token);
      } else {
        localStorage.setItem('emailLoggedIn', 'true');
      }

      // 🚀 Fuerza que el App.jsx escuche el cambio (para mostrar el Navbar)
      window.dispatchEvent(new Event('storage'));

      // 👉 Redirige a la página principal (HomePage)
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="email-login-form-container">
      <h3>Inicia Sesión con Email</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario o Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default EmailLoginForm;
