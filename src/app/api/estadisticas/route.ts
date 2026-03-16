import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/estadisticas
// Obtener estadísticas generales del sistema
export async function GET() {
  try {
    // Conteos básicos
    const [totalTrabajadores, totalEntregas] = await Promise.all([
      db.trabajador.count(),
      db.entregaEPP.count()
    ]);

    // Total de unidades entregadas
    const entregas = await db.entregaEPP.findMany({
      select: { cantidad: true }
    });
    const totalUnidades = entregas.reduce((sum, e) => sum + e.cantidad, 0);

    // Productos más entregados
    const productosRaw = await db.entregaEPP.groupBy({
      by: ['producto'],
      _sum: {
        cantidad: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 10
    });

    const productosTop = productosRaw.map(p => ({
      producto: p.producto,
      cantidad: Number(p._sum.cantidad) || 0,
      entregas: Number(p._count.id)
    }));

    // Entregas por año - usando Prisma en lugar de raw query para evitar BigInt
    const todasEntregas = await db.entregaEPP.findMany({
      select: { fecha: true, cantidad: true }
    });

    const entregasPorAñoMap = new Map<number, { entregas: number; unidades: number }>();
    
    for (const entrega of todasEntregas) {
      const año = entrega.fecha.getFullYear();
      const actual = entregasPorAñoMap.get(año) || { entregas: 0, unidades: 0 };
      actual.entregas += 1;
      actual.unidades += entrega.cantidad;
      entregasPorAñoMap.set(año, actual);
    }

    const entregasPorAño = Array.from(entregasPorAñoMap.entries())
      .map(([año, datos]) => ({
        año,
        entregas: datos.entregas,
        unidades: datos.unidades
      }))
      .sort((a, b) => b.año - a.año);

    // Últimas entregas registradas
    const ultimasEntregas = await db.entregaEPP.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        trabajador: {
          select: { idPersona: true, nombre: true }
        }
      }
    });

    // Trabajadores con más entregas
    const trabajadoresActivosRaw = await db.entregaEPP.groupBy({
      by: ['trabajadorId'],
      _sum: {
        cantidad: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const trabajadoresIds = trabajadoresActivosRaw.map(t => t.trabajadorId);
    const trabajadoresInfo = await db.trabajador.findMany({
      where: {
        idPersona: { in: trabajadoresIds }
      },
      select: { idPersona: true, nombre: true }
    });

    const trabajadoresActivos = trabajadoresActivosRaw.map(t => {
      const info = trabajadoresInfo.find(ti => ti.idPersona === t.trabajadorId);
      return {
        idPersona: t.trabajadorId,
        nombre: info?.nombre || 'Desconocido',
        entregas: Number(t._count.id),
        unidades: Number(t._sum.cantidad) || 0
      };
    });

    return NextResponse.json({
      resumen: {
        totalTrabajadores,
        totalEntregas,
        totalUnidades,
        productosUnicos: productosTop.length
      },
      productosTop,
      entregasPorAño,
      ultimasEntregas: ultimasEntregas.map(e => ({
        fecha: e.fecha.toISOString().split('T')[0],
        producto: e.producto,
        cantidad: e.cantidad,
        trabajador: e.trabajador
      })),
      trabajadoresActivos
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
