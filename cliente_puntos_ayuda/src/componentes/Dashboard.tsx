import { Link, Outlet } from "react-router-dom";
import "./Dashboard.css"; // Importamos el archivo CSS

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            {/* Menú lateral */}
            <aside className="sidebar">
                <h2 className="sidebar-title">Dashboard</h2>
                <nav>
                    <ul className="sidebar-nav">
                        <li>
                            <Link to="/dashboard/puntos_ayuda" className="sidebar-link">
                                Puntos de Ayuda
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Área principal */}
            <main className="main-content">
                <Outlet /> {/* Aquí se renderizarán las rutas anidadas (Alumnos o Carreras) */}
            </main>
        </div>
    );
};

export default Dashboard;