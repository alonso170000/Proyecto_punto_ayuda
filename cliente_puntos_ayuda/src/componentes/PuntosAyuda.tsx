import { useEffect, useState } from "react";
import apiClient from "../api/client";
import "./PuntosAyuda.css";

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
  creado_por?: number;
}

interface NuevoPunto {
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  capacidad: string;
  recursos: string;
  contacto: string;
  estado: string;
  creado_por?: number;
}

const PuntosAyuda = () => {
  const [puntos, setPuntos] = useState<PuntoAyuda[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPunto, setNuevoPunto] = useState<NuevoPunto>({
    nombre: "",
    direccion: "",
    latitud: "",
    longitud: "",
    capacidad: "",
    recursos: "",
    contacto: "",
    estado: "activo",
  });

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const response = await apiClient.get("/puntos/get?admin_id=2");
        setPuntos(response.data);
      } catch (error) {
        console.error("Error al obtener puntos:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };
    fetchPuntos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNuevoPunto((prev) => ({ ...prev, [name]: value }));
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch (e) {
      console.error("Error decodificando token:", e);
      return null;
    }
  };

  //para actualizar el punto
  const handleSubmit = async () => {
    try {
      // Validación de campos requeridos
      if (!nuevoPunto.nombre || !nuevoPunto.direccion) {
        throw new Error("Nombre y dirección son requeridos");
      }

      // Validación de coordenadas
      if (isNaN(parseFloat(nuevoPunto.latitud))) {
        throw new Error("Latitud debe ser un número válido");
      }
      if (isNaN(parseFloat(nuevoPunto.longitud))) {
        throw new Error("Longitud debe ser un número válido");
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        alert("Sesión inválida. Por favor inicie sesión nuevamente");
        window.location.href = "/login";
        return;
      }

      // Cambia esta línea para usar la ruta correcta
      await apiClient.post("/puntos/post", {
        // ← Cambiado de "/puntos" a "/puntos/post"
        nombre: nuevoPunto.nombre,
        direccion: nuevoPunto.direccion,
        latitud: parseFloat(nuevoPunto.latitud),
        longitud: parseFloat(nuevoPunto.longitud),
        capacidad: parseInt(nuevoPunto.capacidad) || 0,
        recursos: nuevoPunto.recursos,
        contacto: nuevoPunto.contacto,
        estado: nuevoPunto.estado,
        creado_por: userId, // ID del admin (deberías obtenerlo del token)
      });

      // Refrescar datos
      const response = await apiClient.get("/puntos/get?admin_id=2");
      setPuntos(response.data);
      setMostrarFormulario(false);
      resetForm();
    } catch (error) {
      console.error("Error al agregar:", error);
      alert(error.message || "Error al guardar el punto");
    }
  };

  const [puntoEditando, setPuntoEditando] = useState<PuntoAyuda | null>(null);

  const resetForm = () => {
    setNuevoPunto({
      nombre: "",
      direccion: "",
      latitud: "",
      longitud: "",
      capacidad: "",
      recursos: "",
      contacto: "",
      estado: "activo",
    });
    setPuntoEditando(null);
  };

  const handleUpdate = async (id: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert("Sesión inválida. Por favor inicie sesión nuevamente");
        window.location.href = "/login";
        return;
      }

      // Validación de campos requeridos
      if (!nuevoPunto.nombre || !nuevoPunto.direccion) {
        throw new Error("Nombre y dirección son requeridos");
      }

      // Validación de coordenadas
      if (isNaN(parseFloat(nuevoPunto.latitud))) {
        throw new Error("Latitud debe ser un número válido");
      }
      if (isNaN(parseFloat(nuevoPunto.longitud))) {
        throw new Error("Longitud debe ser un número válido");
      }

      await apiClient.put(`/puntos/put/${id}`, {
        admin_id: userId,
        nombre: nuevoPunto.nombre,
        direccion: nuevoPunto.direccion,
        latitud: parseFloat(nuevoPunto.latitud),
        longitud: parseFloat(nuevoPunto.longitud),
        capacidad: parseInt(nuevoPunto.capacidad) || 0,
        recursos: nuevoPunto.recursos,
        contacto: nuevoPunto.contacto,
        estado: nuevoPunto.estado,
        creado_por: userId,
      });

      // Refrescar datos
      const response = await apiClient.get("/puntos/get?admin_id=2");
      setPuntos(response.data);
      setMostrarFormulario(false);
      resetForm();
      setPuntoEditando(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert(error.message || "Error al actualizar el punto");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este punto de ayuda?")) {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          alert("Sesión inválida. Por favor inicie sesión nuevamente");
          window.location.href = "/login";
          return;
        }
  
        // Enviar solicitud DELETE con el admin_id en el body
        await apiClient.delete(`/puntos/delete/${id}`, {
          data: { admin_id: userId } // Axios requiere que los datos DELETE vayan en la propiedad 'data'
        });
  
        // Actualizar el estado local eliminando el punto
        setPuntos(puntos.filter(punto => punto.id !== id));
        
        alert("Punto de ayuda eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar:", error);
        
        // Mostrar mensaje de error específico si está disponible
        if (error.response?.data?.mensaje) {
          alert(error.response.data.mensaje);
        } else {
          alert("Error al eliminar el punto de ayuda");
        }
        
        // Si el error es de autenticación, redirigir al login
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    }
  };

  //cambios

  return (
    <div className="puntos-container">
      <h2>Puntos de Ayuda</h2>
      <button
        className="btn-agregar"
        onClick={() => setMostrarFormulario(true)}
      >
        Agregar Punto
      </button>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{puntoEditando ? "Editar Punto de Ayuda" : "Agregar Punto de Ayuda"}</h3>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={nuevoPunto.nombre}
              onChange={handleChange}
            />
            <textarea
              name="direccion"
              placeholder="Dirección"
              value={nuevoPunto.direccion}
              onChange={handleChange}
            />
            <div className="coordenadas-container">
              <input
                type="number"
                step="any"
                name="latitud"
                placeholder="Latitud"
                value={nuevoPunto.latitud}
                onChange={handleChange}
              />
              <input
                type="number"
                step="any"
                name="longitud"
                placeholder="Longitud"
                value={nuevoPunto.longitud}
                onChange={handleChange}
              />
            </div>
            <input
              type="number"
              name="capacidad"
              placeholder="Capacidad"
              value={nuevoPunto.capacidad}
              onChange={handleChange}
            />
            <textarea
              name="recursos"
              placeholder="Recursos disponibles"
              value={nuevoPunto.recursos}
              onChange={handleChange}
            />
            <input
              type="text"
              name="contacto"
              placeholder="Contacto"
              value={nuevoPunto.contacto}
              onChange={handleChange}
            />
            <select
              name="estado"
              value={nuevoPunto.estado}
              onChange={handleChange}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <div className="modal-buttons">
              <button
                onClick={() =>
                  puntoEditando
                    ? handleUpdate(puntoEditando.id)
                    : handleSubmit()
                }
              >
                {puntoEditando ? "Actualizar" : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Capacidad</th>
            <th>Recursos</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puntos.map((punto) => (
            <tr key={punto.id}>
              <td>{punto.nombre}</td>
              <td>{punto.direccion}</td>
              <td>{punto.latitud?.toFixed(6)}</td>
              <td>{punto.longitud?.toFixed(6)}</td>
              <td>{punto.capacidad}</td>
              <td>{punto.recursos}</td>
              <td>{punto.contacto}</td>
              <td>{punto.estado}</td>
              <td>
                <button
                className="lapiz"
                  onClick={() => {
                    setPuntoEditando(punto);
                    setNuevoPunto({
                      nombre: punto.nombre,
                      direccion: punto.direccion,
                      latitud: punto.latitud.toString(),
                      longitud: punto.longitud.toString(),
                      capacidad: punto.capacidad.toString(),
                      recursos: punto.recursos,
                      contacto: punto.contacto,
                      estado: punto.estado,
                    });
                    setMostrarFormulario(true);
                  }}
                >
                  ✏️
                </button>
                <button className="bote" onClick={() => handleDelete(punto.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PuntosAyuda;
