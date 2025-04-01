// src/utils/auth.ts
// Guardar el token en localStorage
export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token); // Cambiado de jwt_token a token
  };
  
  // Obtener el token de localStorage
  export const getAuthToken = (): string | null => {
    return localStorage.getItem('token'); // Cambiado de jwt_token a token
  };
  
  // Eliminar el token (para logout)
  export const removeAuthToken = (): void => {
    localStorage.removeItem('token'); // Cambiado de jwt_token a token
  };
  
  // Verificar si el usuario está autenticado
  export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
  };