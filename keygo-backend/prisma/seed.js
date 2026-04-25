/**
 * KeyGo — Seed manual para Windows
 * Ejecutar con: node prisma/seed.js
 *
 * Instala dependencias si hace falta:
 *   npm install @prisma/client bcrypt
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Iniciando seed de KeyGo...\n');

  const hash = await bcrypt.hash('clave123', 10);

  // ── USUARIOS ────────────────────────────────────────────────────────────────
  const users = [
    { email: 'carlos@keygo.com', full_name: 'Carlos Propietario', phone: '3001234567', role: 'OWNER' },
    { email: 'tienda@keygo.com', full_name: 'Tienda La Esquina', phone: '3009876543', role: 'STORE' },
    { email: 'admin@keygo.com',  full_name: 'Admin KeyGo',        phone: '3111111111', role: 'ADMIN' },
  ];

  for (const u of users) {
    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password_hash: hash, status: true },
    });
    console.log(`✅ Usuario ${result.role}: ${result.email}`);
  }

  // ── PUNTOS ALIADOS ──────────────────────────────────────────────────────────
  const stores = [
    {
      store_name: 'Tienda La Esquina',
      address: 'Cl. 10 #45-12',
      city: 'Bogotá',
      main_phone: '3001234567',
      owner_phone: '3001234568',
      whatsapp: '573001234567',
      email: 'esquina@keygo.com',
      opening_hours: 'Lun-Sab 8:00am - 8:00pm',
      google_maps_link: 'https://maps.google.com/?q=4.6097,-74.0817',
      instructions: 'Preguntar por la encargada KeyGo en el mostrador principal.',
      status: true,
    },
    {
      store_name: 'Oficina Central Bogotá',
      address: 'Av. El Dorado #68B-31',
      city: 'Bogotá',
      main_phone: '3009876543',
      owner_phone: '3009876544',
      whatsapp: '573009876543',
      email: 'central@keygo.com',
      opening_hours: 'Todos los días 10:00 - 23:45',
      google_maps_link: 'https://maps.google.com/?q=4.6561,-74.1058',
      instructions: 'Piso 2, oficina 201. Toca el timbre y menciona KeyGo.',
      status: true,
    },
    {
      store_name: 'Droguería Mi Salud',
      address: 'Kr. 7 #22-35',
      city: 'Bogotá',
      main_phone: '3117654321',
      owner_phone: '3117654322',
      whatsapp: '573117654321',
      email: 'salud@keygo.com',
      opening_hours: 'Lun-Dom 7:00am - 10:00pm',
      google_maps_link: 'https://maps.google.com/?q=4.6158,-74.0697',
      instructions: 'Entregar la llave en caja principal. Solo personal autorizado.',
      status: true,
    },
  ];

  for (const s of stores) {
    const existing = await prisma.store.findFirst({ where: { store_name: s.store_name } });
    if (existing) {
      console.log(`⏩ Punto aliado ya existe: ${s.store_name}`);
      continue;
    }
    const result = await prisma.store.create({ data: s });
    console.log(`✅ Punto aliado: ${result.store_name} (${result.city})`);
  }

  console.log('\n🎉 Seed completado!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('   OWNER: carlos@keygo.com / clave123');
  console.log('   STORE: tienda@keygo.com / clave123');
  console.log('   ADMIN: admin@keygo.com  / clave123\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error en seed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
