const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'changeme123'; // Cambiar esto inmediatamente
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      username,
      name: 'Administrador EPP',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('-----------------------------------');
  console.log('Usuario administrador configurado:');
  console.log(`Usuario: ${username}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
  console.log('RECOMENDACIÓN: Cambia la contraseña después de tu primer ingreso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
