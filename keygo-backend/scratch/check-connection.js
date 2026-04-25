const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Intentando conectar a la base de datos...');
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ ¡CONEXIÓN EXITOSA! Hay ${userCount} usuarios registrados.`);
  } catch (e) {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
