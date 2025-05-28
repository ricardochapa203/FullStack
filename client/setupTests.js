// setupTests.js
import '@testing-library/jest-dom';

// Mock global import.meta.env para Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5050' // o el valor que necesites para pruebas
      }
    }
  }
});