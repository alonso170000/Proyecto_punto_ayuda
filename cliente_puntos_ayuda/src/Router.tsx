import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./componentes/Dashboard";
import PuntosAyuda from "./componentes/PuntosAyuda";
import Login from "./componentes/Login";
import MapPuntosAyuda from "./componentes/MapaPuntosAyuda";
import Registro from "./componentes/Registro";
import VistaAfectado from "./componentes/VistaAfectado";
import PuntosNecesidad from "./componentes/PuntosNecesidad";
import GestionUsuarios from "./componentes/GestionUsuarios";
import GestionSolicitudes from "./componentes/GestionSolicitudes";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPuntosAyuda />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/puntos-necesidad" element={<PuntosNecesidad />} />
        <Route path="/afectado" element={<VistaAfectado />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="/dashboard/puntos_ayuda" element={<PuntosAyuda />} />
          <Route path="/dashboard/usuarios" element={<GestionUsuarios />} />
          <Route path="/dashboard/solicitudes" element={<GestionSolicitudes />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
