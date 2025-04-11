import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './PuntosNecesidad.css';

// Configuración de iconos
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

interface PuntoConNecesidades {
    id: number;
    nombre: string;
    direccion: string;
    latitud: number;
    longitud: number;
    contacto: string;
    necesidades: string[];
    solicitudes_pendientes: number;
}

const PuntosNecesidad = () => {
    const [puntos, setPuntos] = useState<PuntoConNecesidades[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [center] = useState<[number, number]>([18.5, -69.9]); // Centro de RD
    const [filtro, setFiltro] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPuntos = async () => {
            try {
                const response = await apiClient.get('/solicitudes/necesidades');
                setPuntos(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar puntos con necesidades');
                setLoading(false);
                console.error(err);
            }
        };

        fetchPuntos();
    }, []);

    const puntosFiltrados = puntos.filter(punto => 
        filtro === '' || 
        punto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        punto.direccion.toLowerCase().includes(filtro.toLowerCase()) ||
        punto.necesidades.some(n => n.toLowerCase().includes(filtro.toLowerCase()))
    );

    if (loading) return <div className="pn-loading">Cargando puntos de ayuda...</div>;
    if (error) return <div className="pn-error">{error}</div>;

    return (
        <div className="pn-container">
            <div className="pn-header">
                <h1>Puntos que Necesitan Ayuda</h1>
                <button 
                    className="pn-back-button"
                    onClick={() => navigate('/')}
                >
                    Volver al Inicio
                </button>
            </div>

            <div className="pn-filtros">
                <input
                    type="text"
                    placeholder="Filtrar por nombre, dirección o necesidad..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
                <span className="pn-counter">
                    Mostrando {puntosFiltrados.length} de {puntos.length} puntos
                </span>
            </div>

            <div className="pn-content">
                <div className="pn-mapa-container">
                    <MapContainer 
                        center={center} 
                        zoom={10} 
                        style={{ height: '500px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {puntosFiltrados.map((punto) => (
                            <Marker 
                                key={punto.id} 
                                position={[punto.latitud, punto.longitud]}
                                icon={L.icon({
                                    ...L.Icon.Default.prototype.options,
                                    iconUrl: punto.solicitudes_pendientes > 3 ? 
                                        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' :
                                        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'
                                })}
                            >
                                <Popup>
                                    <div className="pn-popup-content">
                                        <h3>{punto.nombre}</h3>
                                        <p><strong>Dirección:</strong> {punto.direccion}</p>
                                        <p><strong>Contacto:</strong> {punto.contacto}</p>
                                        <p><strong>Solicitudes pendientes:</strong> {punto.solicitudes_pendientes}</p>
                                        {punto.necesidades.length > 0 && (
                                            <>
                                                <p><strong>Necesidades:</strong></p>
                                                <ul>
                                                    {punto.necesidades.map((necesidad, index) => (
                                                        <li key={index}>{necesidad}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="pn-lista-container">
                    <h2>Listado de Puntos</h2>
                    {puntosFiltrados.length === 0 ? (
                        <p className="pn-no-results">No se encontraron puntos con los filtros actuales</p>
                    ) : (
                        <div className="pn-lista">
                            {puntosFiltrados.map((punto) => (
                                <div key={punto.id} className="pn-punto-card">
                                    <h3>
                                        {punto.nombre}
                                        <span className="pn-badge">{punto.solicitudes_pendientes} solicitudes</span>
                                    </h3>
                                    <p><strong>Dirección:</strong> {punto.direccion}</p>
                                    <p><strong>Contacto:</strong> {punto.contacto}</p>
                                    <p><strong>Necesidades:</strong> {punto.necesidades.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PuntosNecesidad;