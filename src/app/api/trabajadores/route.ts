import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/trabajadores
// Búsqueda de trabajadores por código o nombre
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const codigo = searchParams.get('codigo');
    const nombre = searchParams.get('nombre');

    // Búsqueda por código (exacta)
    if (codigo) {
      const idPersona = parseInt(codigo, 10);
      if (isNaN(idPersona)) {
        return NextResponse.json(
          { error: 'El código debe ser un número válido' },
          { status: 400 }
        );
      }

      const trabajador = await db.trabajador.findUnique({
        where: { idPersona },
        include: {
          _count: {
            select: { entregas: true }
          }
        }
      });

      if (!trabajador) {
        return NextResponse.json(
          { error: 'Trabajador no encontrado', resultados: [] },
          { status: 404 }
        );
      }

      return NextResponse.json({
        resultados: [{
          idPersona: trabajador.idPersona,
          nombre: trabajador.nombre,
          totalEntregas: trabajador._count.entregas
        }]
      });
    }

    // Búsqueda por nombre (parcial, autocompletado)
    if (nombre) {
      const resultados = await db.trabajador.findMany({
        where: {
          nombre: {
            contains: nombre,
            // SQLite es case-insensitive por defecto para LIKE
          }
        },
        include: {
          _count: {
            select: { entregas: true }
          }
        },
        take: 20, // Limitar resultados para autocompletado
        orderBy: {
          nombre: 'asc'
        }
      });

      return NextResponse.json({
        resultados: resultados.map(t => ({
          idPersona: t.idPersona,
          nombre: t.nombre,
          totalEntregas: t._count.entregas
        }))
      });
    }

    // Sin parámetros de búsqueda, devolver lista paginada
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const [trabajadores, total] = await Promise.all([
      db.trabajador.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { entregas: true }
          }
        },
        orderBy: {
          nombre: 'asc'
        }
      }),
      db.trabajador.count()
    ]);

    return NextResponse.json({
      resultados: trabajadores.map(t => ({
        idPersona: t.idPersona,
        nombre: t.nombre,
        totalEntregas: t._count.entregas
      })),
      paginacion: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
