'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface UploadResult {
  success: boolean;
  message: string;
  estadisticas: {
    totalFilas: number;
    filasProcesadas: number;
    filasConErrores: number;
    trabajadoresNuevos: number;
    entregasNuevas: number;
    entregasActualizadas: number;
  };
  errores: string[];
}

export function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    setResetSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setUploadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleReset = async () => {
    setIsResetting(true);
    setShowConfirm(false);
    setError(null);
    setUploadResult(null);
    setResetSuccess(null);

    try {
      const response = await fetch('/api/reset', { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al resetear');

      setResetSuccess(
        `Base de datos reiniciada: ${data.eliminados.entregas} entregas y ${data.eliminados.trabajadores} trabajadores eliminados.`
      );
      setFileName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reiniciar');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          Carga de Archivo Transaccional
        </CardTitle>
        <CardDescription>
          Sube el archivo Excel (.xls, .xlsx) o CSV con los datos de entregas de EPP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Zona de drop */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="h-12 w-12 mx-auto text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-600">Procesando archivo...</p>
              <Progress value={50} className="w-48 mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos soportados: .xls, .xlsx, .csv
                </p>
              </div>
              {fileName && (
                <p className="text-sm text-emerald-600 font-medium">
                  Archivo: {fileName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reset success */}
        {resetSuccess && (
          <Alert className="border-orange-200 bg-orange-50">
            <CheckCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">{resetSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Resultado exitoso */}
        {uploadResult && (
          <div className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                {uploadResult.message}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {uploadResult.estadisticas.filasProcesadas}
                </p>
                <p className="text-xs text-gray-600">Filas procesadas</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {uploadResult.estadisticas.entregasNuevas}
                </p>
                <p className="text-xs text-gray-600">Entregas nuevas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {uploadResult.estadisticas.trabajadoresNuevos}
                </p>
                <p className="text-xs text-gray-600">Trabajadores nuevos</p>
              </div>
            </div>

            {uploadResult.errores.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Advertencias ({uploadResult.errores.length} filas con errores):
                </p>
                <ul className="text-xs text-amber-700 space-y-1 max-h-24 overflow-y-auto">
                  {uploadResult.errores.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones + descarga */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          <p className="font-medium mb-1">Columnas requeridas en el archivo:</p>
          <ul className="grid grid-cols-2 gap-1">
            <li>• FECHA (Fecha de entrega)</li>
            <li>• ID_PERSONA (Código del trabajador)</li>
            <li>• NOMBRE_PERSONA (Nombre completo)</li>
            <li>• PRODUCTO (Nombre del EPP)</li>
            <li>• CANTIDAD (Unidades entregadas)</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
            <a
              href="/plantilla_epp.xlsx"
              download
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla Excel (.xlsx)
            </a>
            <p className="text-xs text-gray-400">Abrí la plantilla en Excel, completá con tus datos y subila aquí.</p>
          </div>
        </div>

        {/* ──────────────── BOTÓN RESET 3D ──────────────── */}
        <div className="pt-2 border-t border-gray-100">
          {!showConfirm ? (
            <button
              id="btn-reset-db"
              onClick={() => setShowConfirm(true)}
              disabled={isResetting || isUploading}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-xl font-semibold text-white text-sm
                transition-all duration-150 select-none
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-red-600
                shadow-[0_6px_0_#991b1b,0_8px_12px_rgba(220,38,38,0.4)]
                hover:shadow-[0_4px_0_#991b1b,0_6px_8px_rgba(220,38,38,0.35)]
                hover:translate-y-[2px]
                active:shadow-[0_1px_0_#991b1b,0_2px_4px_rgba(220,38,38,0.3)]
                active:translate-y-[5px]
              "
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isResetting ? 'Reiniciando base de datos...' : '🗑️ Resetear todos los datos'}
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">¿Estás seguro?</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Esta acción eliminará <strong>todos los trabajadores y entregas</strong> de la base de datos. No se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="
                    flex-1 px-4 py-2 rounded-lg font-semibold text-white text-sm
                    bg-red-600
                    shadow-[0_4px_0_#991b1b,0_6px_8px_rgba(220,38,38,0.35)]
                    hover:shadow-[0_2px_0_#991b1b,0_4px_6px_rgba(220,38,38,0.3)]
                    hover:translate-y-[2px]
                    active:shadow-[0_1px_0_#991b1b]
                    active:translate-y-[3px]
                    transition-all duration-100
                  "
                >
                  Sí, borrar todo
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="
                    flex-1 px-4 py-2 rounded-lg font-semibold text-gray-700 text-sm
                    bg-white border border-gray-300
                    shadow-[0_4px_0_#d1d5db]
                    hover:shadow-[0_2px_0_#d1d5db]
                    hover:translate-y-[2px]
                    active:shadow-[0_1px_0_#d1d5db]
                    active:translate-y-[3px]
                    transition-all duration-100
                  "
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
