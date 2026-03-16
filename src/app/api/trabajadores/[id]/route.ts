import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/trabajadores/[id]
// Obtener datos completos del trabajador con resumen anual e historial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idPersona = parseInt(id, 10);

    if (isNaN(idPersona)) {
      return NextResponse.json(
        { error: 'ID de trabajador inválido' },
        { status: 400 }
      );
    }

    // Buscar el trabajador
    const trabajador = await db.trabajador.findUnique({
      where: { idPersona },
      include: {
        entregas: {
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    if (!trabajador) {
      return NextResponse.json(
        { error: 'Trabajador no encontrado' },
        { status: 404 }
      );
    }

    // Procesar resumen anual (tabla pivote)
    const resumenAnual: Record<string, Record<string, number>> = {};
    const añosSet = new Set<number>();
    const productosSet = new Set<string>();

    for (const entrega of trabajador.entregas) {
      const año = entrega.fecha.getFullYear();
      const producto = entrega.producto;

      añosSet.add(año);
      productosSet.add(producto);

      if (!resumenAnual[producto]) {
        resumenAnual[producto] = {};
      }

      if (!resumenAnual[producto][año]) {
        resumenAnual[producto][año] = 0;
      }

      resumenAnual[producto][año] += entrega.cantidad;
    }

    // Ordenar años y productos
    const años = Array.from(añosSet).sort((a, b) => a - b);
    const productos = Array.from(productosSet).sort();

    // Crear estructura para la tabla pivote
    const tablaPivote = productos.map(producto => {
      const fila: Record<string, number | string> = { producto };
      for (const año of años) {
        fila[año.toString()] = resumenAnual[producto][año] || 0;
      }
      // Total por producto
      fila['total'] = Object.values(resumenAnual[producto] || {}).reduce((a, b) => a + b, 0);
      return fila;
    });

    // Calcular totales por año
    const totalesPorAño: Record<string, number> = {};
    for (const año of años) {
      totalesPorAño[año.toString()] = productos.reduce(
        (sum, producto) => sum + (resumenAnual[producto][año] || 0),
        0
      );
    }
    const totalGeneral = Object.values(totalesPorAño).reduce((a, b) => a + b, 0);

    // Historial detallado
    const historial = trabajador.entregas.map(entrega => {
      // Formato DD/MM/YYYY
      const d = entrega.fecha;
      const dia  = String(d.getUTCDate()).padStart(2, '0');
      const mes  = String(d.getUTCMonth() + 1).padStart(2, '0');
      const año  = d.getUTCFullYear();
      return {
        id: entrega.id,
        fecha: `${dia}/${mes}/${año}`,
        producto: entrega.producto,
        cantidad: entrega.cantidad
      };
    });

    const formatFecha = (d: Date) => {
      const dia  = String(d.getUTCDate()).padStart(2, '0');
      const mes  = String(d.getUTCMonth() + 1).padStart(2, '0');
      const año  = d.getUTCFullYear();
      return `${dia}/${mes}/${año}`;
    };

    // Estadísticas generales
    const totalEntregas = trabajador.entregas.length;
    const totalUnidades = trabajador.entregas.reduce((sum, e) => sum + e.cantidad, 0);
    const primeraEntrega = trabajador.entregas.length > 0 
      ? formatFecha(trabajador.entregas[trabajador.entregas.length - 1].fecha)
      : null;
    const ultimaEntrega = trabajador.entregas.length > 0 
      ? formatFecha(trabajador.entregas[0].fecha)
      : null;


    return NextResponse.json({
      trabajador: {
        idPersona: trabajador.idPersona,
        nombre: trabajador.nombre
      },
      estadisticas: {
        totalEntregas,
        totalUnidades,
        primeraEntrega,
        ultimaEntrega,
        productosUnicos: productos.length,
        añosConEntregas: años.length
      },
      resumenAnual: {
        años,
        productos,
        tablaPivote,
        totalesPorAño,
        totalGeneral
      },
      historial
    });

  } catch (error) {
    console.error('Error obteniendo trabajador:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
