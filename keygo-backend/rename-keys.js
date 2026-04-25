const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const names = [
  'Casillero Gym FitLife – Medellín',
  'Consultorio Terapia Zen – Bogotá',
  'Casillero Spa Serenidad – Cali',
  'Oficina Coworking NextHub – Cartagena',
  'Casillero Piscina AquaClub – Barranquilla',
  'Consultorio Fisioterapia – Bucaramanga',
  'Casillero Crossfit Elite – Medellín',
  'Apartamento Airbnb – Bogotá',
];

async function main() {
  const keys = await prisma.key.findMany({ orderBy: { created_at: 'asc' } });
  console.log('Llaves encontradas:', keys.length);
  for (let i = 0; i < keys.length && i < names.length; i++) {
    await prisma.key.update({ where: { id: keys[i].id }, data: { key_name: names[i] } });
    console.log('Actualizada:', names[i]);
  }
  console.log('¡Listo!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
