import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import MapPuntosAyuda from './MapaPuntosAyuda'; // Importamos el componente del mapa
import { getAuthToken, decodeToken } from '../utils/authToken';
import './VistaAfectado.css';


interface Solicitud {
    id: number;
    tipo_ayuda: string;
    descripcion: string;
    estado: string;
    fecha: string;
    punto_ayuda_nombre: string;
}

const VistaAfectado = () => {
    const [activeTab, setActiveTab] = useState<'mapa' | 'solicitar' | 'solicitudes'>('mapa');
    const [puntosAyuda, setPuntosAyuda] = useState<any[]>([]);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [formData, setFormData] = useState({
        punto_ayuda_id: '',
        tipo_ayuda: 'alimentos',
        descripcion: '',
        contacto: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Obtener puntos de ayuda al cargar
    useEffect(() => {
        const fetchPuntosAyuda = async () => {
            try {
                const response = await apiClient.get('/puntos/puntosactivos/get');
                setPuntosAyuda(response.data);
            } catch (err) {
                console.error("Error al obtener puntos:", err);
            }
        };

        fetchPuntosAyuda();
    }, []);

// Obtener solicitudes del usuario cuando active la pestaña
    useEffect(() => {
        if (activeTab === 'solicitudes') {
            const fetchSolicitudes = async () => {
                try {
                    const response = await apiClient.get('/solicitudes/usuario');
                    setSolicitudes(response.data);
                } catch (err) {
                    console.error("Error al obtener solicitudes:", err);
                }
            };

            fetchSolicitudes();
        }
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            // Obtener el ID del usuario del token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No estás autenticado');
            }
    
            // Decodificar el token para obtener el userId (implementa esta función)
            const decodedToken = decodeToken(token);
            const usuario_id = decodedToken.userId;
    
            const response = await apiClient.post('/solicitudes/post', {
                ...formData,
                usuario_id // Asegúrate de incluir el usuario_id
            });
            
            // Actualizar lista de solicitudes
            const nuevasSolicitudes = [{
                id: response.data.solicitudId,
                tipo_ayuda: formData.tipo_ayuda,
                descripcion: formData.descripcion,
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                punto_ayuda_nombre: puntosAyuda.find(p => p.id == formData.punto_ayuda_id)?.nombre || ''
            }, ...solicitudes];
    
            setSolicitudes(nuevasSolicitudes);
            setFormData({
                punto_ayuda_id: '',
                tipo_ayuda: 'alimentos',
                descripcion: '',
                contacto: ''
            });
            setActiveTab('solicitudes');
        } catch (err) {
            console.error('Error detallado:', err.response?.data || err.message);
            setError(err.response?.data?.mensaje || err.message || 'Error al enviar solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div className="afectado-container">
      <header className="afectado-header">
        <h1>Bienvenido Afectado</h1>
        <button 
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/');
          }}
        >
          Cerrar Sesión
        </button>
      </header>
      
      <div className="afectado-tabs">
        <button 
          className={`tab-button ${activeTab === 'mapa' ? 'active' : ''}`}
          onClick={() => setActiveTab('mapa')}
        >
          Mapa de Ayuda
        </button>
        <button 
          className={`tab-button ${activeTab === 'solicitar' ? 'active' : ''}`}
          onClick={() => setActiveTab('solicitar')}
        >
          Solicitar Ayuda
        </button>
        <button 
          className={`tab-button ${activeTab === 'solicitudes' ? 'active' : ''}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          Mis Solicitudes
        </button>
      </div>

      <div className="afectado-content">
        {activeTab === 'mapa' && <MapPuntosAyuda />}
        
        {activeTab === 'solicitar' && (
                    <div className="solicitud-form">
                        <h2>Solicitar Ayuda</h2>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Punto de Ayuda:</label>
                                <select
                                    name="punto_ayuda_id"
                                    value={formData.punto_ayuda_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione un punto</option>
                                    {puntosAyuda.map(punto => (
                                        <option key={punto.id} value={punto.id}>
                                            {punto.nombre} - {punto.direccion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Tipo de Ayuda:</label>
                                <select
                                    name="tipo_ayuda"
                                    value={formData.tipo_ayuda}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="alimentos">Alimentos</option>
                                    <option value="medicinas">Medicinas</option>
                                    <option value="refugio">Refugio</option>
                                    <option value="ropa">Ropa</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Contacto:</label>
                                <input
                                    type="text"
                                    name="contacto"
                                    value={formData.contacto}
                                    onChange={handleChange}
                                    required
                                    placeholder="Teléfono o email para contactarle"
                                />
                            </div>
                            
                            <button className='submit-button' type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                        </form>
                    </div>
                )}
                
                {activeTab === 'solicitudes' && (
                    <div className="solicitudes-list">
                        <h2>Mis Solicitudes</h2>
                        
                        {solicitudes.length === 0 ? (
                            <p>No has realizado ninguna solicitud</p>
                        ) : (
                            solicitudes.map(solicitud => (
                                <div key={solicitud.id} className="solicitud-card">
                                    <h3>
                                        {solicitud.tipo_ayuda} - 
                                        <span className={`estado-${solicitud.estado}`}>
                                            {solicitud.estado}
                                        </span>
                                    </h3>
                                    <p><strong>Punto de ayuda:</strong> {solicitud.punto_ayuda_nombre}</p>
                                    <p><strong>Fecha:</strong> {new Date(solicitud.fecha).toLocaleDateString()}</p>
                                    <p><strong>Descripción:</strong> {solicitud.descripcion}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
      </div>
    </div>
  );
};

export default VistaAfectado;