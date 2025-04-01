import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./componentes/Dashboard";
import PuntosAyuda from "./componentes/PuntosAyuda";
import Login from "./componentes/Login";
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                
                <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="/dashboard/puntos_ayuda" element={<PuntosAyuda />} />
                    </Route>
                
            
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;