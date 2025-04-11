import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './Login.css'; // Reutilizamos los estilos del login

const Registro: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validación básica
        if (!nombre || !email || !password || !telefono) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await apiClient.post('/usuarios/usuario/post', {
                nombre,
                email,
                contraseña: password,
                telefono
            });

            if (response.data.mensaje) {
                setSuccess(response.data.mensaje);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar usuario');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Registro de Afectado</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div style={{color: '#4CAF50', textAlign: 'center', marginBottom: '1rem'}}>{success}</div>}
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                    />
                    <input
                        type="tel"
                        placeholder="Teléfono de contacto"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                    <button type="submit">Registrarse</button>
                </form>
                
                <div className="tienes-cuenta">
                    ¿Ya tienes cuenta?{' '}
                    <span 
                        className="tienes-inicia" 
                        onClick={() => navigate('/login')}
                    >
                        Inicia sesión
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Registro;