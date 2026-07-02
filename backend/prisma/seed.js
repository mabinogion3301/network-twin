const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      permissions: {
        'stations.create': true, 'stations.read': true, 'stations.update': true, 'stations.delete': true,
        'equipments.create': true, 'equipments.read': true, 'equipments.update': true, 'equipments.delete': true,
        'ports.create': true, 'ports.read': true, 'ports.update': true, 'ports.delete': true,
        'connections.create': true, 'connections.read': true, 'connections.update': true, 'connections.delete': true,
        'simulations.run': true, 'simulations.read': true,
        'users.create': true, 'users.read': true, 'users.update': true, 'users.delete': true,
        'roles.create': true, 'roles.read': true, 'roles.update': true, 'roles.delete': true,
      },
    },
  });

  await prisma.role.upsert({
    where: { name: 'Operador' },
    update: {},
    create: {
      name: 'Operador',
      permissions: {
        'stations.read': true,
        'equipments.read': true,
        'ports.read': true,
        'connections.read': true,
        'simulations.run': true,
        'simulations.read': true,
      },
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@telebras.local' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@telebras.local',
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const types = ['Switch', 'Roteador', 'OLT', 'ONU', 'Rádio', 'Servidor', 'Firewall', 'Patch Panel', 'Conversor de mídia', 'Outro'];
  for (const name of types) {
    await prisma.equipmentType.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('Seed concluído. Usuário admin: admin@telebras.local / senha: admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
