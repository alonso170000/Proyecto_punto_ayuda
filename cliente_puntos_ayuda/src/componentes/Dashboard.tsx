import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getAuthToken, removeAuthToken } from "../utils/authToken";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        removeAuthToken();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Menú lateral */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Panel Admin</h2>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
                
                <nav>
                    <ul className="sidebar-nav">
                        <li>
                            <Link to="/dashboard/puntos_ayuda" className="sidebar-link">
                                <i className="fas fa-map-marker-alt"></i> Puntos de Ayuda
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/solicitudes" className="asidebar-link">
                                <i className="fas fa-hands-helping"></i> Solicitudes de Ayuda
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Área principal */}
            <main className="main-content">
                <Outlet /> 
            </main>
        </div>
    );
};
export default Dashboard;