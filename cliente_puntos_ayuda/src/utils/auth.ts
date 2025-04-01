// src/utils/auth.ts

// Guardar el token en localStorage
export const setAuthToken = (token: string): void => {
    localStorage.setItem('jwt_token', token);
  };
  
  // Obtener el token de localStorage
  export const getAuthToken = (): string | null => {
    return localStorage.getItem('jwt_token');
  };
  
  // Eliminar el token (para logout)
  export const removeAuthToken = (): void => {
    localStorage.removeItem('jwt_token');
  };
  
  // Verificar si el usuario está autenticado
  export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
  };
  
  