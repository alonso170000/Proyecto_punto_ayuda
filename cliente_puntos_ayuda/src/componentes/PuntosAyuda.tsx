import { useEffect, useState } from "react";
import apiClient from "../api/client"; 
import "./PuntosAyuda.css";

interface PuntoAyuda {
  id: number;
  nombre: string;
  direccion: string;
  capacidad: number;
  recursos: string;
  contacto: string;
  estado: string;
}

interface NuevoPunto {
  nombre: string;
  direccion: string;
  capacidad: string;
  recursos: string;
  contacto: string;
  estado: string;
}

const PuntosAyuda = () => {
  const [puntos, setPuntos] = useState<PuntoAyuda[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPunto, setNuevoPunto] = useState<NuevoPunto>({
    nombre: "",
    direccion: "",
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
          //window.location.href = "/login";
        }
      }
    };
    fetchPuntos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNuevoPunto(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await apiClient.post("/puntos", {
        ...nuevoPunto,
        capacidad: parseInt(nuevoPunto.capacidad),
      });
      
      // Refrescar datos
      const response = await apiClient.get("/puntos/get?admin_id=2");
      setPuntos(response.data);
      setMostrarFormulario(false);
      setNuevoPunto({
        nombre: "",
        direccion: "",
        capacidad: "",
        recursos: "",
        contacto: "",
        estado: "activo",
      });
    } catch (error) {
      console.error("Error al agregar:", error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await apiClient.put(`/puntos/${id}`, {
        ...nuevoPunto,
        capacidad: parseInt(nuevoPunto.capacidad),
      });
      
      const response = await apiClient.get("/puntos/get?admin_id=2");
      setPuntos(response.data);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Eliminar este punto?")) {
      try {
        await apiClient.delete(`/puntos/${id}`);
        setPuntos(puntos.filter(punto => punto.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };


//Aqui cambias


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
            <h3>Agregar Punto de Ayuda</h3>
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
              <button onClick={handleSubmit}>Guardar</button>
              <button onClick={() => setMostrarFormulario(false)}>
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
              <td>{punto.capacidad}</td>
              <td>{punto.recursos}</td>
              <td>{punto.contacto}</td>
              <td>{punto.estado}</td>
              <td>
                <button onClick={() => handleUpdate(punto.id)}>✏️</button>
                <button onClick={() => handleDelete(punto.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PuntosAyuda;
