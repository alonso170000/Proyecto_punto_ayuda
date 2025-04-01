// src/api/auth.ts
import apiClient from './client';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/login', {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json' // Asegúrate que esté presente
      }
    });
    
    return response.data;
  };