// src/utils/getApiUrl.js
export function getApiUrl() {
  // Si estamos en entorno de test (Jest), retorna una URL mockeada
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    return 'http://localhost:3000';
  }
  // Usa import.meta.env solo si está disponible (en Vite)
  // Pero NO accedas nunca a import.meta en Jest, porque ni siquiera puede ser referenciado
  return (typeof window !== 'undefined' && window?.__VITE_API_URL) || 'http://localhost:5050';
}
