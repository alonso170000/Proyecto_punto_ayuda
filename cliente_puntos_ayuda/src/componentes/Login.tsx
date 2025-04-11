// src/componentes/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import "./Login.css";
import { setAuthToken } from "../utils/authToken";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Paso 1: Enviar credenciales al servidor
      const { token, user } = await login(email, password);

      // Paso 2: Guardar token recibido
      setAuthToken(token);

      // Paso 3: Redirigir según el tipo de usuario
      if (user.tipo === 'administrador' || user.tipo === 'superadmin') {
        navigate("/dashboard");
      } else if (user.tipo === 'afectado') {
        navigate("/afectado"); // Nueva ruta para afectados
      } else {
        // Redirigir a una página genérica si el tipo no coincide
        navigate("/");
      }
    } catch (err) {
      setError("Credenciales incorrectas");
      console.error("Error en login:", err);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="tienes-cuenta">
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/registro")} className="tienes-inicia">
            Registrate
          </span>
        </p>
      </div>
    </div>
  );
};
export default Login;