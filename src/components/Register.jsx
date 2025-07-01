import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../auth/AuthService';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      console.log('Registro exitoso:', response);
      localStorage.setItem('token', response.token);
      navigate('/publications'); // Redirige a la página principal después del registro
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;