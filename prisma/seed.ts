import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Productos EPP reales
const PRODUCTOS_EPP = [
  'Casco de Seguridad',
  'Guantes de Cuero',
  'Botas de Seguridad',
  'Lentes de Protección',
  'Chaleco Reflectivo',
  'Tapones Auditivos',
  'Mascarilla KN95',
  'Arnés de Seguridad',
  'Casco con Protector Facial',
  'Guantes de Nitrilo',
  'Overol de Trabajo',
  'Protector Auditivo',
];

// Trabajadores de prueba
const TRABAJADORES = [
  { id: 1001, nombre: 'MAMANI QUISPE JOSE LUIS' },
  { id: 1002, nombre: 'CONDORI FLORES MARIA ELENA' },
  { id: 1003, nombre: 'QUISPE MAMANI PEDRO PABLO' },
  { id: 1004, nombre: 'FLORES CONDORI ANA MARIA' },
  { id: 1005, nombre: 'GUTIERREZ LOPEZ CARLOS ALBERTO' },
  { id: 1006, nombre: 'HUANCA TICONA ROSA ELENA' },
  { id: 1007, nombre: 'COPA VARGAS JUAN CARLOS' },
  { id: 1008, nombre: 'TICONA HUANCA LUCIA BEATRIZ' },
  { id: 1009, nombre: 'VARGAS COPA MARIO OSCAR' },
  { id: 1010, nombre: 'LOPEZ GUTIERREZ SILVIA PATRICIA' },
  { id: 1011, nombre: 'CHOQUE APAZA ROBERTO ANTONIO' },
  { id: 1012, nombre: 'APAZA CHOQUE CARMEN VERONICA' },
  { id: 1013, nombre: 'MORALES NINA PABLO CESAR' },
  { id: 1014, nombre: 'NINA MORALES FERNANDA AURORA' },
  { id: 1015, nombre: 'CALLISAYA MAMANI EDGAR OMAR' },
  { id: 1016, nombre: 'MAMANI CALLISAYA GLORIA JUDITH' },
  { id: 1017, nombre: 'LIMACHI FLORES VICTOR HUGO' },
  { id: 1018, nombre: 'FLORES LIMACHI NATIVIDAD RUTH' },
  { id: 1019, nombre: 'QUISBERT LAURA GONZALO LUIS' },
  { id: 1020, nombre: 'LAURA QUISBERT MIRIAM ELSA' },
];

// Generar fecha aleatoria entre 2023 y 2025
function randomDate(start: Date, end: Date): Date {
  const diff = end.getTime() - start.getTime();
  const randomMs = Math.floor(Math.random() * diff);
  const d = new Date(start.getTime() + randomMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  await db.entregaEPP.deleteMany();
  await db.trabajador.deleteMany();
  console.log('🗑️  Datos anteriores eliminados');

  // Insertar trabajadores
  for (const t of TRABAJADORES) {
    await db.trabajador.create({
      data: { idPersona: t.id, nombre: t.nombre },
    });
  }
  console.log(`✅ ${TRABAJADORES.length} trabajadores insertados`);

  // Generar entregas de los últimos 2 años
  const inicio = new Date(2023, 0, 1);
  const fin = new Date(2025, 11, 31);

  let totalEntregas = 0;
  const entregasSet = new Set<string>(); // para evitar duplicados

  for (const trabajador of TRABAJADORES) {
    // Cada trabajador recibe entre 8 y 20 entregas en el período
    const numEntregas = Math.floor(Math.random() * 12) + 8;

    for (let i = 0; i < numEntregas; i++) {
      const producto = PRODUCTOS_EPP[Math.floor(Math.random() * PRODUCTOS_EPP.length)];
      const fecha = randomDate(inicio, fin);
      const cantidad = Math.floor(Math.random() * 3) + 1;

      // Clave única: fecha + trabajador + producto
      const key = `${fecha.toISOString()}-${trabajador.id}-${producto}`;
      if (entregasSet.has(key)) continue;
      entregasSet.add(key);

      try {
        await db.entregaEPP.create({
          data: {
            fecha,
            trabajadorId: trabajador.id,
            producto,
            cantidad,
          },
        });
        totalEntregas++;
      } catch {
        // Ignorar duplicados
      }
    }
  }

  console.log(`✅ ${totalEntregas} entregas de EPP insertadas`);
  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
