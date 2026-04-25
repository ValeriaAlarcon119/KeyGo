import axios from 'axios';
import Constants from 'expo-constants';

// =============================================================================
// CONFIGURACIÓN UNIVERSAL DE LA API
// =============================================================================
// 1. Si tienes un túnel (Ngrok/LocalTunnel), pon la URL aquí:
const TUNNEL_URL = ""; // Ej: "https://keygo-api.loca.lt"

// 2. Detección automática para Expo Go (IP Local)
const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.experienceUrl;
const debuggerHost = hostUri?.split(':')[0]?.replace('exp://', '');

// 3. Selección de la URL final
// Prioridad: Túnel > IP Detectada (Móvil) > Localhost (Web/Emulador)
const API_URL = TUNNEL_URL 
  ? TUNNEL_URL 
  : (debuggerHost && debuggerHost !== 'localhost')
    ? `http://${debuggerHost}:3000` 
    : 'http://localhost:3000';

console.log('[KeyGo API] Configuración:', {
  hostUri,
  debuggerHost,
  conectandoA: API_URL
});

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000, // Aumentado para túneles o redes lentas
});

export default api;
