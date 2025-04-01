import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// 1. CREACIÓN DE LA INSTANCIA BASE
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // URL base de tu API
  headers: {
    'Content-Type': 'application/json', // Configuración por defecto
  },
  timeout: 10000, // Opcional: tiempo máximo de espera
});

// 2. INTERCEPTOR DE SOLICITUDES (REQUEST)
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  
  // Si existe un token, lo añade al header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  // Manejo de errores en la solicitud
  return Promise.reject(error);
});

// 3. INTERCEPTOR DE RESPUESTAS (RESPONSE)
apiClient.interceptors.response.use(
  (response) => {
    // Cualquier código 2xx cae aquí
    return response;
  },
  (error) => {
    // Cualquier código fuera de 2xx cae aquí
    
    // Manejo específico para errores 401 (No autorizado)
    if (error.response?.status === 401) {
      // Aquí puedes:
      // 1. Redirigir al login
      // 2. Intentar renovar el token (si usas refresh tokens)
      // 3. Limpiar el token inválido
      console.error('Sesión expirada o no autorizado');
      window.location.href = '/login'; // Ejemplo de redirección
    }
    
    // Manejo de otros errores comunes
    if (error.response?.status >= 500) {
      console.error('Error del servidor');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;