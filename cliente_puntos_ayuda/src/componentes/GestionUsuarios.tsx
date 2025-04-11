import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getAuthToken } from '../utils/authToken';
import './GestionUsuarios.css';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    tipo: string;
    telefono: string;
    fecha_registro: string;
}

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        // Obtener usuario actual del token
        const token = getAuthToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(payload);
        }

        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            // Solo superadmins pueden ver todos los usuarios
            const response = await apiClient.get(`/usuarios/admin/get/${currentUser?.userId}?superadmin_id=${currentUser?.userId}`);
            setUsuarios(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar usuarios');
            setLoading(false);
            console.error(err);
        }
    };

    const cambiarTipoUsuario = async (userId: number, nuevoTipo: string) => {
        try {
            // Endpoint para actualizar tipo de usuario
            await apiClient.put(`/usuarios/admin/post`, { 
                superadmin_id: currentUser?.userId,
                admin_id: userId,
                tipo: nuevoTipo
            });
            setUsuarios(usuarios.map(u => 
                u.id === userId ? { ...u, tipo: nuevoTipo } : u
            ));
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            alert('No tienes permisos para realizar esta acción');
        }
    };

    const eliminarUsuario = async (userId: number) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await apiClient.delete('/usuarios/admin/delete', {
                    data: {
                        superadmin_id: currentUser?.userId,
                        admin_id: userId
                    }
                });
                setUsuarios(usuarios.filter(u => u.id !== userId));
            } catch (err) {
                console.error('Error al eliminar usuario:', err);
                alert('No tienes permisos para realizar esta acción');
            }
        }
    };

    if (loading) return <div className="gu-loading">Cargando usuarios...</div>;
    if (error) return <div className="gu-error">{error}</div>;

    return (
        <div className="gestion-usuarios">
            <h2>Gestión de Usuarios</h2>
            <p className="gu-subtitle">Administra los usuarios del sistema (solo para superadministradores)</p>
            
            <div className="gu-table-container">
                <table className="gu-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Teléfono</th>
                            <th>Registro</th>
                            {currentUser?.tipo === 'superadmin' && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.email}</td>
                                <td>
                                    {currentUser?.tipo === 'superadmin' ? (
                                        <select
                                            value={usuario.tipo}
                                            onChange={(e) => cambiarTipoUsuario(usuario.id, e.target.value)}
                                            className={`gu-tipo-select gu-tipo-${usuario.tipo}`}
                                        >
                                            <option value="afectado">Afectado</option>
                                            <option value="voluntario">Voluntario</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                    ) : (
                                        <span className={`gu-tipo-badge gu-tipo-${usuario.tipo}`}>
                                            {usuario.tipo}
                                        </span>
                                    )}
                                </td>
                                <td>{usuario.telefono || '-'}</td>
                                <td>{new Date(usuario.fecha_registro).toLocaleDateString()}</td>
                                {currentUser?.tipo === 'superadmin' && (
                                    <td>
                                        <button 
                                            className="gu-action-button gu-delete"
                                            onClick={() => eliminarUsuario(usuario.id)}
                                        >
                                            <i className="fas fa-trash"></i> Eliminar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionUsuarios;