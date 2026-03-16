'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, User, Hash, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Trabajador {
  idPersona: number;
  nombre: string;
  totalEntregas: number;
}

interface SearchPanelProps {
  onSelectTrabajador: (id: number) => void;
}

export function SearchPanel({ onSelectTrabajador }: SearchPanelProps) {
  // Búsqueda por código
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [isSearchingCodigo, setIsSearchingCodigo] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  // Búsqueda por nombre
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Trabajador[]>([]);
  const [isSearchingNombre, setIsSearchingNombre] = useState(false);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const sugerenciasRef = useRef<HTMLDivElement>(null);
  const inputNombreRef = useRef<HTMLInputElement>(null);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sugerenciasRef.current &&
        !sugerenciasRef.current.contains(event.target as Node) &&
        inputNombreRef.current &&
        !inputNombreRef.current.contains(event.target as Node)
      ) {
        setShowSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda por código (exacta)
  const handleBuscarCodigo = useCallback(async () => {
    if (!codigoBusqueda.trim()) return;

    setIsSearchingCodigo(true);
    setErrorCodigo(null);

    try {
      const response = await fetch(`/api/trabajadores?codigo=${encodeURIComponent(codigoBusqueda)}`);
      const data = await response.json();

      if (!response.ok) {
        setErrorCodigo(data.error || 'Error en la búsqueda');
        return;
      }

      if (data.resultados && data.resultados.length > 0) {
        onSelectTrabajador(data.resultados[0].idPersona);
        setCodigoBusqueda('');
      }
    } catch {
      setErrorCodigo('Error de conexión');
    } finally {
      setIsSearchingCodigo(false);
    }
  }, [codigoBusqueda, onSelectTrabajador]);

  // Búsqueda por nombre con debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (nombreBusqueda.length >= 2) {
        setIsSearchingNombre(true);
        try {
          const response = await fetch(`/api/trabajadores?nombre=${encodeURIComponent(nombreBusqueda)}`);
          const data = await response.json();
          setSugerencias(data.resultados || []);
          setShowSugerencias(true);
        } catch {
          setSugerencias([]);
        } finally {
          setIsSearchingNombre(false);
        }
      } else {
        setSugerencias([]);
        setShowSugerencias(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nombreBusqueda]);

  const handleSelectSugerencia = (trabajador: Trabajador) => {
    onSelectTrabajador(trabajador.idPersona);
    setNombreBusqueda('');
    setSugerencias([]);
    setShowSugerencias(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-600" />
          Búsqueda de Trabajadores
        </CardTitle>
        <CardDescription>
          Busca por código o nombre para ver el historial de entregas de EPP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Búsqueda por Código */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Buscar por Código
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Ej: 12345"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscarCodigo()}
              className="flex-1"
            />
            <Button
              onClick={handleBuscarCodigo}
              disabled={isSearchingCodigo || !codigoBusqueda.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSearchingCodigo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
          {errorCodigo && (
            <p className="text-sm text-red-600">{errorCodigo}</p>
          )}
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">o</span>
          </div>
        </div>

        {/* Búsqueda por Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Buscar por Nombre
          </label>
          <div className="relative">
            <Input
              ref={inputNombreRef}
              type="text"
              placeholder="Escribe al menos 2 caracteres..."
              value={nombreBusqueda}
              onChange={(e) => setNombreBusqueda(e.target.value)}
              className="w-full pr-10"
            />
            {isSearchingNombre && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            {nombreBusqueda && !isSearchingNombre && (
              <button
                onClick={() => {
                  setNombreBusqueda('');
                  setSugerencias([]);
                  setShowSugerencias(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Sugerencias */}
            {showSugerencias && sugerencias.length > 0 && (
              <div
                ref={sugerenciasRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                {sugerencias.map((trabajador) => (
                  <button
                    key={trabajador.idPersona}
                    onClick={() => handleSelectSugerencia(trabajador)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors",
                      "border-b border-gray-100 last:border-0"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {trabajador.nombre}
                        </p>
                        <p className="text-sm text-gray-500">
                          Código: {trabajador.idPersona}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          {trabajador.totalEntregas} entregas
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {showSugerencias && sugerencias.length === 0 && nombreBusqueda.length >= 2 && !isSearchingNombre && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No se encontraron trabajadores con ese nombre
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
