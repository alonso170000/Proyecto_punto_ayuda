import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getAuthToken } from '../utils/authToken';
import './GestionSolicitudes.css';

interface Solicitud {
    id: number;
    usuario_id: number;
    punto_ayuda_id: number;
    tipo_ayuda: string;
    descripcion: string;
    estado: string;
    fecha: string;
    contacto: string;
    usuario_nombre: string;
    punto_ayuda_nombre: string;
}

const GestionSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('');

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                // Este endpoint deberá ser creado en tu backend
                const response = await apiClient.get('/solicitudes/admin');
                setSolicitudes(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar solicitudes');
                setLoading(false);
                console.error(err);
            }
        };

        fetchSolicitudes();
    }, []);

    const cambiarEstadoSolicitud = async (solicitudId: number, nuevoEstado: string) => {
        try {
            const tokenPayload = JSON.parse(atob(getAuthToken()!.split('.')[1]));
            
            await apiClient.put(`/solicitudes/put/${solicitudId}`, { 
                estado: nuevoEstado,
                admin_id: tokenPayload.userId
            });
            
            setSolicitudes(solicitudes.map(s => 
                s.id === solicitudId ? { ...s, estado: nuevoEstado } : s
            ));
            
            // Opcional: Mostrar feedback positivo
            alert('Estado actualizado correctamente');
        } catch (err) {
            console.error('Error al actualizar solicitud:', err);
            
            // Mensaje más descriptivo
            const errorMessage = err.response?.data?.mensaje || 
                                'Error al actualizar el estado. Verifica tus permisos.';
            
            alert(errorMessage);
            
            // Recargar datos para mantener consistencia
            const response = await apiClient.get('/solicitudes/admin');
            setSolicitudes(response.data);
        }
    };

    const solicitudesFiltradas = solicitudes.filter(s => 
        filtroEstado === '' || s.estado === filtroEstado
    );

    if (loading) return <div className="gs-loading">Cargando solicitudes...</div>;
    if (error) return <div className="gs-error">{error}</div>;

    return (
        <div className="gestion-solicitudes">
            <h2>Gestión de Solicitudes</h2>
            <p className="gs-subtitle">Administra las solicitudes de ayuda recibidas</p>
            
            <div className="gs-filters">
                <select 
                    className="gs-filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="atendida">Atendidas</option>
                    <option value="rechazada">Rechazadas</option>
                </select>
            </div>
            
            <div className="gs-table-container">
                <table className="gs-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Punto de Ayuda</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Contacto</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudesFiltradas.map(solicitud => (
                            <tr key={solicitud.id}>
                                <td>{solicitud.id}</td>
                                <td>{solicitud.usuario_nombre}</td>
                                <td>{solicitud.punto_ayuda_nombre}</td>
                                <td>{solicitud.tipo_ayuda}</td>
                                <td className="gs-descripcion">{solicitud.descripcion}</td>
                                <td>{solicitud.contacto}</td>
                                <td>{new Date(solicitud.fecha).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={solicitud.estado}
                                        onChange={(e) => cambiarEstadoSolicitud(solicitud.id, e.target.value)}
                                        className={`gs-estado-select gs-estado-${solicitud.estado}`}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="atendida">Atendida</option>
                                        <option value="rechazada">Rechazada</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionSolicitudes;