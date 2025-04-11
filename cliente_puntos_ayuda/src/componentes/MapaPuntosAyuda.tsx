import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { getAuthToken } from "../utils/authToken";
import "./MapaPuntosAyuda.css";

// Configuración de iconos (igual que antes)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,  
});

interface PuntoAyuda {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad: number;
  recursos: string;
  contacto: string;
  estado: string;
}

const MapPuntosAyuda: React.FC = () => {
  const [puntos, setPuntos] = useState<PuntoAyuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center] = useState<[number, number]>([18.5, -69.9]);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar
    setIsAuthenticated(!!getAuthToken());

    const fetchPuntos = async () => {
      try {
        const response = await apiClient.get("/puntos/puntosactivos/get");
        setPuntos(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los puntos de ayuda");
        setLoading(false);
        console.error(err);
      }
    };

    fetchPuntos();
  }, []);

  if (loading)
    return <div className="tloading">Cargando puntos de ayuda...</div>;
  if (error) return <div className="terror">{error}</div>;

  return (
    <div className="tbody">
      {/* Cabecera siempre visible */}
      <header className="tapp-header">
        <div className="theader-content">
          <h1 className="tapp-title">Puntos de Ayuda</h1>
          <div className="tauth-buttons">
            {!isAuthenticated ? (
              <>
                <button
                  className="tnecesidades-button"
                  onClick={() => navigate("/puntos-necesidad")}
                >
                  Necesitan Ayuda
                </button>
                <button
                  className="tlogin-button"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sesión
                </button>
                <button
                  className="tregister-button"
                  onClick={() => navigate("/registro")}
                >
                  Registrarse
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="tmapa-puntos-container">
        {/* Mostrar mapa siempre */}
        <div className="tmapa-container">
          <MapContainer
            center={center}
            zoom={3}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {puntos.map((punto) => (
              <Marker key={punto.id} position={[punto.latitud, punto.longitud]}>
                <Popup>
                  <div className="tpopup-content">
                    <h3>{punto.nombre}</h3>
                    <p>
                      <strong>Dirección:</strong> {punto.direccion}
                    </p>
                    <p>
                      <strong>Capacidad:</strong> {punto.capacidad}
                    </p>
                    <p>
                      <strong>Recursos:</strong> {punto.recursos}
                    </p>
                    <p>
                      <strong>Contacto:</strong> {punto.contacto}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Mostrar lista de puntos siempre */}
        <div className="tpuntos-lista">
          <h3>Lista de Puntos</h3>
          {puntos.map((punto) => (
            <div key={punto.id} className="tpunto-card">
              <h4>{punto.nombre}</h4>
              <p>
                <strong>Dirección:</strong> {punto.direccion}
              </p>
              <p>
                <strong>Recursos:</strong> {punto.recursos}
              </p>
              <p>
                <strong>Contacto:</strong> {punto.contacto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPuntosAyuda;
