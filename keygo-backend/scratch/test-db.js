const net = require('net');

const configs = [
    { host: 'aws-1-us-east-1.pooler.supabase.com', port: 6543, name: 'Pooler (Session)' },
    { host: 'aws-1-us-east-1.pooler.supabase.com', port: 5432, name: 'Pooler (Direct/Transaction)' },
    { host: 'db.ygphobmmdlsxcfzfqdrn.supabase.co', port: 5432, name: 'Direct Database Host' }
];

configs.forEach(config => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`✅ [${config.name}] Conexión EXITOSA a ${config.host}:${config.port} (${Date.now() - start}ms)`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`❌ [${config.name}] TIEMPO AGOTADO en ${config.host}:${config.port}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`❌ [${config.name}] ERROR en ${config.host}:${config.port} -> ${err.message}`);
    });

    socket.connect(config.port, config.host);
});
