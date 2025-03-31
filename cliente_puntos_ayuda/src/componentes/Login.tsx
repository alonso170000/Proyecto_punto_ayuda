import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/usuario/get', { email, password });
      
      if (response.data.success) {
        alert('Login exitoso');
        navigate('/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Error en la conexión con el servidor');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Correo electrónico:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {/* <label>
          Admin:
          <input type="Number" value={id} onChange={(e) => setIdAdmin(e.target.value)} required />
        </label> */}
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
