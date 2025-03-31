import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./componentes/Dashboard";
import PuntosAyuda from "./componentes/PuntosAyuda";
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />}>
                <Route path="/dashboard/puntos_ayuda" element={<PuntosAyuda />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;