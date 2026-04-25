import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed de KeyGo...');

  // ── 1. CREAR USUARIOS DE PRUEBA ───────────────────────────────────────────
  const hash = await bcrypt.hash('clave123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'carlos@keygo.com' },
    update: {},
    create: {
      full_name: 'Carlos Propietario',
      email: 'carlos@keygo.com',
      phone: '3001234567',
      password_hash: hash,
      role: 'OWNER',
      status: true,
    },
  });
  console.log(`✅ Usuario OWNER: ${owner.email}`);

  const storeUser = await prisma.user.upsert({
    where: { email: 'tienda@keygo.com' },
    update: {},
    create: {
      full_name: 'Tienda La Esquina',
      email: 'tienda@keygo.com',
      phone: '3009876543',
      password_hash: hash,
      role: 'STORE',
      status: true,
    },
  });
  console.log(`✅ Usuario STORE: ${storeUser.email}`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@keygo.com' },
    update: {},
    create: {
      full_name: 'Admin KeyGo',
      email: 'admin@keygo.com',
      phone: '3111111111',
      password_hash: hash,
      role: 'ADMIN',
      status: true,
    },
  });
  console.log(`✅ Usuario ADMIN: ${admin.email}`);

  // ── 2. CREAR PUNTOS ALIADOS ────────────────────────────────────────────────
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
      store_name: 'Oficina Central',
      address: 'Av. El Dorado #68B-31',
      city: 'Bogotá',
      main_phone: '3009876543',
      owner_phone: '3009876544',
      whatsapp: '573009876543',
      email: 'central@keygo.com',
      opening_hours: 'Todos los días 10:00 - 23:45 | Pausa 12:20 a 12:30',
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

  for (const storeData of stores) {
    const existingStore = await prisma.store.findFirst({
      where: { store_name: storeData.store_name },
    });

    if (!existingStore) {
      const store = await prisma.store.create({
        data: storeData,
      });
      console.log(`✅ Punto aliado: ${store.store_name} (${store.city})`);
    } else {
      console.log(`⏩ Punto aliado ya existe: ${storeData.store_name}`);
    }
  }

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('   OWNER: carlos@keygo.com / clave123');
  console.log('   STORE: tienda@keygo.com / clave123');
  console.log('   ADMIN: admin@keygo.com / clave123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
