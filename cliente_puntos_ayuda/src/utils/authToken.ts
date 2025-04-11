// src/utils/auth.ts
// Guardar el token en localStorage
export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token); 
  };
  
  // Obtener el token de localStorage
  export const getAuthToken = (): string | null => {
    return localStorage.getItem('token'); 
  };
  
  // Eliminar el token (para logout)
  export const removeAuthToken = (): void => {
    localStorage.removeItem('token');
  };
  
  // Verificar si el usuario está autenticado
  export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
  };

  export const decodeToken = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (e) {
        console.error('Error decodificando token:', e);
        return null;
    }
};