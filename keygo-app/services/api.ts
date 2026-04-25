import axios from 'axios';
import Constants from 'expo-constants';

// Detecta automáticamente la IP de tu máquina cuando usas Expo Go.
// Probamos múltiples fuentes de la IP para mayor compatibilidad.
const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.experienceUrl;
const debuggerHost = hostUri?.split(':')[0]?.replace('exp://', '');

// Priorizamos la IP detectada, si no, usamos localhost (para emuladores o web)
const API_URL = debuggerHost && debuggerHost !== 'localhost'
  ? `http://${debuggerHost}:3000` 
  : 'http://localhost:3000';

console.log('[KeyGo API] Host detectado:', hostUri);
console.log('[KeyGo API] Conectando a:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // Aumentamos timeout para redes móviles lentas
});

export default api;
