import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';

interface ProcesedRow {
  fecha: Date;
  idPersona: number;
  nombrePersona: string;
  producto: string;
  cantidad: number;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  if (typeof value === 'string') {
    const cleanDate = value.replace(/\s+\d{2}:\d{2}:\d{2}$/, '').trim();
    const formats = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];
    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        let year: number, month: number, day: number;
        if (format === formats[0]) {
          [, year, month, day] = match.map(Number);
        } else {
          [, day, month, year] = match.map(Number);
        }
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month - 1, day);
        }
      }
    }
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  return null;
}

function parseInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/[,\s]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

// Escapa comillas simples para SQL
function esc(s: string): string {
  return s.replace(/'/g, "''");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo' }, { status: 400 });
    }

    // ── FASE 1: Leer Excel y parsear en memoria ──
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'El archivo no contiene datos' }, { status: 400 });
    }

    // Detectar columnas con nombres alternativos
    const columnMappings: Record<string, string[]> = {
      fecha:         ['FECHA', 'fecha', 'Fecha'],
      idPersona:     ['ID_PERSONA', 'id_persona', 'ID PERSONA', 'CODIGO', 'codigo', 'CÓDIGO'],
      nombrePersona: ['NOMBRE_PERSONA', 'nombre_persona', 'NOMBRE PERSONA', 'NOMBRE', 'nombre'],
      producto:      ['PRODUCTO', 'producto', 'Producto', 'EPP', 'epp'],
      cantidad:      ['CANTIDAD', 'cantidad', 'Cantidad', 'CANT', 'cant'],
    };

    const findColumn = (row: Record<string, unknown>, options: string[]): string | null => {
      for (const opt of options) {
        if (Object.prototype.hasOwnProperty.call(row, opt)) return opt;
      }
      return null;
    };

    const firstRow = rawData[0];
    const colFecha         = findColumn(firstRow, columnMappings.fecha);
    const colIdPersona     = findColumn(firstRow, columnMappings.idPersona);
    const colNombrePersona = findColumn(firstRow, columnMappings.nombrePersona);
    const colProducto      = findColumn(firstRow, columnMappings.producto);
    const colCantidad      = findColumn(firstRow, columnMappings.cantidad);

    const missingColumns: string[] = [];
    if (!colFecha)         missingColumns.push('FECHA');
    if (!colIdPersona)     missingColumns.push('ID_PERSONA');
    if (!colNombrePersona) missingColumns.push('NOMBRE_PERSONA');
    if (!colProducto)      missingColumns.push('PRODUCTO');
    if (!colCantidad)      missingColumns.push('CANTIDAD');

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Faltan columnas requeridas: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    // ── FASE 2: Parsear y validar filas ──
    const processedData: ProcesedRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2;

      const fecha = parseDate(row[colFecha!]);
      if (!fecha) { errors.push(`Fila ${rowNum}: Fecha inválida`); continue; }

      const idPersona = parseInteger(row[colIdPersona!]);
      if (idPersona === null) { errors.push(`Fila ${rowNum}: ID_PERSONA inválido`); continue; }

      const nombrePersona = cleanText(row[colNombrePersona!]);
      if (!nombrePersona) { errors.push(`Fila ${rowNum}: Nombre vacío`); continue; }

      const producto = cleanText(row[colProducto!]);
      if (!producto) { errors.push(`Fila ${rowNum}: Producto vacío`); continue; }

      const cantidad = parseInteger(row[colCantidad!]);
      if (cantidad === null || cantidad <= 0) { errors.push(`Fila ${rowNum}: Cantidad inválida`); continue; }

      processedData.push({ fecha, idPersona, nombrePersona, producto, cantidad });
    }

    // ── FASE 3: Crear trabajadores (Prisma createMany soporta skipDuplicates en PostgreSQL) ──
    const trabajadoresMap = new Map<number, string>();
    for (const row of processedData) {
      if (!trabajadoresMap.has(row.idPersona)) {
        trabajadoresMap.set(row.idPersona, row.nombrePersona);
      }
    }

    const trabajadoresData = Array.from(trabajadoresMap.entries()).map(([id, nombre]) => ({
      idPersona: id,
      nombre: nombre
    }));

    const countTrabAntes = await db.trabajador.count();
    
    await db.trabajador.createMany({
      data: trabajadoresData,
      skipDuplicates: true
    });

    const countTrabDespues = await db.trabajador.count();
    const trabajadoresInsertados = countTrabDespues - countTrabAntes;

    // ── FASE 4: Crear entregas ──
    const entregasMap = new Map<string, { fecha: Date; trabajadorId: number; producto: string; cantidad: number }>();
    for (const row of processedData) {
      const key = `${row.fecha.getTime()}-${row.idPersona}-${row.producto}`;
      if (!entregasMap.has(key)) {
        entregasMap.set(key, {
          fecha:        row.fecha,
          trabajadorId: row.idPersona,
          producto:     row.producto,
          cantidad:     row.cantidad,
        });
      }
    }

    const entregasData = Array.from(entregasMap.values()).map(e => ({
      fecha: e.fecha,
      trabajadorId: e.trabajadorId,
      producto: e.producto,
      cantidad: e.cantidad
    }));

    const countEntAntes = await db.entregaEPP.count();

    await db.entregaEPP.createMany({
      data: entregasData,
      skipDuplicates: true
    });

    const countEntDespues = await db.entregaEPP.count();
    const entregasInsertadas = countEntDespues - countEntAntes;

    return NextResponse.json({
      success: true,
      message: 'Archivo procesado correctamente',
      estadisticas: {
        totalFilas:          rawData.length,
        filasProcesadas:     processedData.length,
        filasConErrores:     errors.length,
        trabajadoresNuevos:  trabajadoresInsertados,
        entregasNuevas:      entregasInsertadas,
        entregasActualizadas: 0,
      },
      errores: errors.slice(0, 10),
    });

  } catch (error) {
    console.error('Error procesando archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el archivo' },
      { status: 500 }
    );
  }
}
