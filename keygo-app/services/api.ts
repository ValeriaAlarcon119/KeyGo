import axios from 'axios';
import Constants from 'expo-constants';

// Detecta automáticamente la IP de tu máquina cuando usas Expo Go.
// Si hostUri existe (ej: "192.168.1.10:8081"), extraemos la IP y usamos el puerto 3000 del backend.
const hostUri = Constants.expoConfig?.hostUri;
const debuggerHost = hostUri?.split(':')[0];

const API_URL = debuggerHost 
  ? `http://${debuggerHost}:3000` 
  : 'http://localhost:3000'; // Fallback para web o emuladores

console.log('Conectando a API en:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default api;
