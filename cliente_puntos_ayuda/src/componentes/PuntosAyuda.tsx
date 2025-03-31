import { useEffect, useState } from "react";
import axios from "axios";
import "./PuntosAyuda.css";

const API_URL = "http://localhost:3000/api";

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
        const response = await axios.get<PuntoAyuda[]>(
          `${API_URL}/puntos/get?admin_id=2`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Agrega el token JWT
            },
          }
        );
        console.log("Datos recibidos:", response.data);
        setPuntos(response.data);
      } catch (error) {
        console.error("Error al obtener puntos de ayuda", error);
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

  const handleLogin = async () => {
    try {
        const response = await axios.post("http://localhost:3000/api/login", {
            email: "alonso@email.com",
            password: "1234" // Cambia según el backend
        });
        localStorage.setItem("token", response.data.token);
        alert("Login exitoso");
    } catch (error) {
        console.error("Error en login", error);
    }
};


  const handleSubmit = async () => {
    try {
      await axios.post(API_URL, {
        ...nuevoPunto,
        capacidad: parseInt(nuevoPunto.capacidad),
      });
      alert("Punto de ayuda agregado");
      setMostrarFormulario(false);
      // Refrescar los datos en lugar de recargar la página
      const response = await axios.get<PuntoAyuda[]>(API_URL);
      setPuntos(response.data);
      setNuevoPunto({
        nombre: "",
        direccion: "",
        capacidad: "",
        recursos: "",
        contacto: "",
        estado: "activo",
      });
    } catch (error) {
      console.error("Error al agregar", error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`${API_URL}/${id}`, {
        ...nuevoPunto,
        capacidad: parseInt(nuevoPunto.capacidad),
      });
      alert("Punto actualizado");
      // Refrescar los datos
      const response = await axios.get<PuntoAyuda[]>(API_URL);
      setPuntos(response.data);
    } catch (error) {
      console.error("Error al actualizar", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este punto de ayuda?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        alert("Punto de ayuda eliminado");
        // Actualizar el estado local en lugar de recargar
        setPuntos(puntos.filter((punto) => punto.id !== id));
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

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
