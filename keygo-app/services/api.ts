import axios from 'axios';

// En desarrollo local apunta a tu máquina. En producción se cambiará a la URL de AWS.
const API_URL = 'http://192.168.10.27:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default api;
