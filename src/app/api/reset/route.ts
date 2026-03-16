import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE() {
  try {
    // Borrar en orden correcto por la FK
    await db.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
    const entregas = await db.entregaEPP.deleteMany();
    const trabajadores = await db.trabajador.deleteMany();
    await db.$executeRawUnsafe('PRAGMA foreign_keys = ON');

    return NextResponse.json({
      success: true,
      message: 'Base de datos reiniciada correctamente',
      eliminados: {
        entregas: entregas.count,
        trabajadores: trabajadores.count,
      },
    });
  } catch (error) {
    console.error('Error al resetear:', error);
    return NextResponse.json(
      { error: 'Error al reiniciar la base de datos' },
      { status: 500 }
    );
  }
}
