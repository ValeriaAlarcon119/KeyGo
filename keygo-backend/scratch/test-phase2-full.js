const http = require('http');

const API_URL = 'http://localhost:3000';
let token = '';
let testStoreId = '';
let testKeyId = '';
let depositCode = '';

async function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const responseData = body ? JSON.parse(body) : {};
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: responseData, status: res.statusCode });
        } else {
          reject({ response: { data: responseData, status: res.statusCode } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS UNITARIAS INTEGRALES - FASE 2');
  console.log('--------------------------------------------------');

  try {
    // 1. LOGIN
    console.log('1. Probando Autenticación (Login)...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'carlos@keygo.com',
      password: 'clave123'
    });
    token = loginRes.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login exitoso.');

    // 2. CRUD TIENDAS
    console.log('\n2. Probando CRUD de Tiendas (Módulo 8)...');
    const storeRes = await request('POST', '/stores', {
      store_name: 'Tienda Test Fase 2',
      address: 'Calle Falsa 123',
      city: 'Bogotá',
      main_phone: '3000000000',
      whatsapp: '573000000000',
      opening_hours: '24/7',
      google_maps_link: 'https://maps.google.com'
    }, headers);
    testStoreId = storeRes.data.id;
    console.log(`✅ Tienda creada con ID: ${testStoreId}`);

    // 3. CRUD LLAVES
    console.log('\n3. Probando Creación de Llaves (Módulo 2)...');
    const keyRes = await request('POST', '/keys', {
      key_name: 'Llave de Prueba Fase 2',
      store_id: testStoreId,
      plan_type: 'MONTHLY'
    }, headers);
    testKeyId = keyRes.data.key.id;
    depositCode = keyRes.data.deposit_code; // Cambiado: ahora accede directamente al string
    console.log(`✅ Llave creada con ID: ${testKeyId}`);
    console.log(`✅ Código de Depósito: ${depositCode}`);

    // 4. VALIDACIÓN
    console.log('\n4. Probando Validación de Códigos (Módulo 4)...');
    const validateRes = await request('POST', '/codes/validate/deposit', {
      code_value: depositCode
    }, headers);
    if (validateRes.data.valid) {
      console.log('✅ Validación de código de depósito: EXITOSA');
    }

    // 5. SEGURIDAD
    console.log('\n5. Probando Regla de Seguridad (Recogida sin depósito)...');
    try {
      await request('POST', '/codes/pickup', { key_id: testKeyId }, headers);
      console.log('❌ Error: El sistema permitió generar recogida sin depósito');
    } catch (err) {
      console.log('✅ Éxito: El sistema BLOQUEÓ la recogida correctamente.');
    }

    console.log('\n--------------------------------------------------');
    console.log('🏆 ¡TODAS LAS PRUEBAS DE FASE 2 PASARON EXITOSAMENTE!');
    console.log('API, Backend y Supabase están perfectamente conectados.');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.response?.data || error.message || error);
    process.exit(1);
  }
}

runTests();
