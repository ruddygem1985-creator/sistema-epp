const XLSX = require('xlsx');
const path = require('path');

// Datos de ejemplo para la plantilla
const datos = [
  { FECHA: '2024-01-15', ID_PERSONA: 1001, NOMBRE_PERSONA: 'MAMANI QUISPE JOSE LUIS', PRODUCTO: 'Casco de Seguridad', CANTIDAD: 1 },
  { FECHA: '2024-01-15', ID_PERSONA: 1001, NOMBRE_PERSONA: 'MAMANI QUISPE JOSE LUIS', PRODUCTO: 'Guantes de Cuero', CANTIDAD: 2 },
  { FECHA: '2024-02-10', ID_PERSONA: 1002, NOMBRE_PERSONA: 'CONDORI FLORES MARIA ELENA', PRODUCTO: 'Botas de Seguridad', CANTIDAD: 1 },
  { FECHA: '2024-02-10', ID_PERSONA: 1002, NOMBRE_PERSONA: 'CONDORI FLORES MARIA ELENA', PRODUCTO: 'Chaleco Reflectivo', CANTIDAD: 1 },
  { FECHA: '2024-03-05', ID_PERSONA: 1003, NOMBRE_PERSONA: 'QUISPE MAMANI PEDRO PABLO', PRODUCTO: 'Lentes de Protección', CANTIDAD: 1 },
  { FECHA: '2024-03-05', ID_PERSONA: 1003, NOMBRE_PERSONA: 'QUISPE MAMANI PEDRO PABLO', PRODUCTO: 'Mascarilla KN95', CANTIDAD: 5 },
  { FECHA: '2024-04-20', ID_PERSONA: 1004, NOMBRE_PERSONA: 'FLORES CONDORI ANA MARIA', PRODUCTO: 'Tapones Auditivos', CANTIDAD: 2 },
  { FECHA: '2024-04-20', ID_PERSONA: 1004, NOMBRE_PERSONA: 'FLORES CONDORI ANA MARIA', PRODUCTO: 'Guantes de Nitrilo', CANTIDAD: 2 },
  { FECHA: '2024-05-15', ID_PERSONA: 1005, NOMBRE_PERSONA: 'GUTIERREZ LOPEZ CARLOS', PRODUCTO: 'Casco de Seguridad', CANTIDAD: 1 },
  { FECHA: '2024-05-15', ID_PERSONA: 1005, NOMBRE_PERSONA: 'GUTIERREZ LOPEZ CARLOS', PRODUCTO: 'Arnés de Seguridad', CANTIDAD: 1 },
];

// Crear workbook
const wb = XLSX.utils.book_new();

// Hoja de datos
const ws = XLSX.utils.json_to_sheet(datos);

// Estilo: ancho de columnas
ws['!cols'] = [
  { wch: 14 }, // FECHA
  { wch: 12 }, // ID_PERSONA
  { wch: 35 }, // NOMBRE_PERSONA
  { wch: 25 }, // PRODUCTO
  { wch: 10 }, // CANTIDAD
];

XLSX.utils.book_append_sheet(wb, ws, 'EPP_Entregas');

// Hoja de instrucciones
const instrucciones = [
  { COLUMNA: 'FECHA', FORMATO: 'YYYY-MM-DD o DD/MM/YYYY', EJEMPLO: '2024-01-15', OBLIGATORIO: 'SÍ' },
  { COLUMNA: 'ID_PERSONA', FORMATO: 'Número entero', EJEMPLO: '1001', OBLIGATORIO: 'SÍ' },
  { COLUMNA: 'NOMBRE_PERSONA', FORMATO: 'Texto - nombre completo', EJEMPLO: 'MAMANI QUISPE JOSE', OBLIGATORIO: 'SÍ' },
  { COLUMNA: 'PRODUCTO', FORMATO: 'Texto - nombre del EPP', EJEMPLO: 'Casco de Seguridad', OBLIGATORIO: 'SÍ' },
  { COLUMNA: 'CANTIDAD', FORMATO: 'Número entero positivo', EJEMPLO: '2', OBLIGATORIO: 'SÍ' },
];

const wsInstr = XLSX.utils.json_to_sheet(instrucciones);
wsInstr['!cols'] = [
  { wch: 16 },
  { wch: 25 },
  { wch: 25 },
  { wch: 12 },
];
XLSX.utils.book_append_sheet(wb, wsInstr, 'Instrucciones');

// Guardar en public/
const outputPath = path.join(__dirname, '../public/plantilla_epp.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Plantilla Excel generada en: public/plantilla_epp.xlsx');
