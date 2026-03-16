'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Calendar,
  Package,
  Hash,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkerViewProps {
  trabajadorId: number | null;
  onBack: () => void;
}

interface TrabajadorData {
  trabajador: {
    idPersona: number;
    nombre: string;
  };
  estadisticas: {
    totalEntregas: number;
    totalUnidades: number;
    primeraEntrega: string | null;
    ultimaEntrega: string | null;
    productosUnicos: number;
    añosConEntregas: number;
  };
  resumenAnual: {
    años: number[];
    productos: string[];
    tablaPivote: Record<string, number | string>[];
    totalesPorAño: Record<string, number>;
    totalGeneral: number;
  };
  historial: {
    id: string;
    fecha: string;
    producto: string;
    cantidad: number;
  }[];
}

export function WorkerView({ trabajadorId, onBack }: WorkerViewProps) {
  const [data, setData] = useState<TrabajadorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación del historial
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Paleta de 40 colores pasteles únicos ──
  const PRODUCT_COLORS = [
    { bg: 'bg-sky-100',        text: 'text-sky-900'       },
    { bg: 'bg-emerald-100',    text: 'text-emerald-900'   },
    { bg: 'bg-violet-100',     text: 'text-violet-900'    },
    { bg: 'bg-amber-100',      text: 'text-amber-900'     },
    { bg: 'bg-rose-100',       text: 'text-rose-900'      },
    { bg: 'bg-teal-100',       text: 'text-teal-900'      },
    { bg: 'bg-orange-100',     text: 'text-orange-900'    },
    { bg: 'bg-indigo-100',     text: 'text-indigo-900'    },
    { bg: 'bg-lime-100',       text: 'text-lime-900'      },
    { bg: 'bg-pink-100',       text: 'text-pink-900'      },
    { bg: 'bg-cyan-100',       text: 'text-cyan-900'      },
    { bg: 'bg-fuchsia-100',    text: 'text-fuchsia-900'   },
    { bg: 'bg-yellow-100',     text: 'text-yellow-900'    },
    { bg: 'bg-red-100',        text: 'text-red-900'       },
    { bg: 'bg-blue-100',       text: 'text-blue-900'      },
    { bg: 'bg-green-100',      text: 'text-green-900'     },
    { bg: 'bg-purple-100',     text: 'text-purple-900'    },
    { bg: 'bg-slate-200',      text: 'text-slate-900'     },
    { bg: 'bg-stone-200',      text: 'text-stone-900'     },
    { bg: 'bg-zinc-200',       text: 'text-zinc-900'      },
    { bg: 'bg-sky-200',        text: 'text-sky-900'       },
    { bg: 'bg-emerald-200',    text: 'text-emerald-900'   },
    { bg: 'bg-violet-200',     text: 'text-violet-900'    },
    { bg: 'bg-amber-200',      text: 'text-amber-900'     },
    { bg: 'bg-rose-200',       text: 'text-rose-900'      },
    { bg: 'bg-teal-200',       text: 'text-teal-900'      },
    { bg: 'bg-orange-200',     text: 'text-orange-900'    },
    { bg: 'bg-indigo-200',     text: 'text-indigo-900'    },
    { bg: 'bg-lime-200',       text: 'text-lime-900'      },
    { bg: 'bg-pink-200',       text: 'text-pink-900'      },
    { bg: 'bg-cyan-200',       text: 'text-cyan-900'      },
    { bg: 'bg-fuchsia-200',    text: 'text-fuchsia-900'   },
    { bg: 'bg-yellow-200',     text: 'text-yellow-900'    },
    { bg: 'bg-red-200',        text: 'text-red-900'       },
    { bg: 'bg-blue-200',       text: 'text-blue-900'      },
    { bg: 'bg-green-200',      text: 'text-green-900'     },
    { bg: 'bg-purple-200',     text: 'text-purple-900'    },
    { bg: 'bg-sky-300',        text: 'text-sky-900'       },
    { bg: 'bg-emerald-300',    text: 'text-emerald-900'   },
    { bg: 'bg-violet-300',     text: 'text-violet-900'    },
    { bg: 'bg-amber-300',      text: 'text-amber-900'     },
  ];

  // Mapa producto → color: asignación SECUENCIAL por orden de aparición (sin repetición)
  // Se recalcula cuando cambian los datos del trabajador
  const productColorMap = (() => {
    const map = new Map<string, typeof PRODUCT_COLORS[0]>();
    if (!data) return map;
    let idx = 0;
    // Recorre todos los productos únicos en el orden que aparecen
    for (const fila of data.resumenAnual.tablaPivote) {
      const p = fila.producto as string;
      if (!map.has(p)) {
        map.set(p, PRODUCT_COLORS[idx % PRODUCT_COLORS.length]);
        idx++;
      }
    }
    return map;
  })();

  const getProductColor = (producto: string) =>
    productColorMap.get(producto) ?? PRODUCT_COLORS[0];



  const fetchData = useCallback(async () => {
    if (!trabajadorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trabajadores/${trabajadorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar datos');
      }

      setData(result);
      setCurrentPage(1); // Resetear paginación
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [trabajadorId]);

  useEffect(() => {
    if (trabajadorId) {
      fetchData();
    }
  }, [trabajadorId, fetchData]);

  if (!trabajadorId) return null;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Cargando datos del trabajador...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-red-600">{error}</div>
          <Button onClick={onBack} variant="outline" className="mt-4 mx-auto block">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la búsqueda
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Calcular paginación del historial
  const totalItems = data.historial.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistorial = data.historial.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Button onClick={onBack} variant="ghost" className="text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a la búsqueda
      </Button>

      {/* Cabecera del Trabajador */}
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{data.trabajador.nombre}</h2>
              <div className="flex items-center gap-4 mt-1 text-emerald-100">
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  Código: {data.trabajador.idPersona}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.estadisticas.totalEntregas}</p>
                <p className="text-sm text-gray-600">Entregas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.estadisticas.totalUnidades}</p>
                <p className="text-sm text-gray-600">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.estadisticas.productosUnicos}</p>
                <p className="text-sm text-gray-600">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.estadisticas.añosConEntregas}</p>
                <p className="text-sm text-gray-600">Años</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección A: Resumen Anual (Tabla Pivote) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Resumen Anual de Entregas
          </CardTitle>
          <CardDescription>
            Cantidad de EPP entregados por año
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.resumenAnual.tablaPivote.length > 0 ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                      Producto
                    </TableHead>
                    {data.resumenAnual.años.map((año) => (
                      <TableHead key={año} className="font-semibold text-center min-w-[80px]">
                        {año}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-center bg-emerald-50 min-w-[80px]">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.resumenAnual.tablaPivote.map((fila, idx) => {
                    const color = getProductColor(fila.producto as string);
                    return (
                      <TableRow key={idx} className={`${color.bg} hover:opacity-90`}>
                        <TableCell className={`font-medium sticky left-0 z-10 ${color.bg} ${color.text}`}>
                          {fila.producto as string}
                        </TableCell>
                        {data.resumenAnual.años.map((año) => (
                          <TableCell key={año} className={`text-center ${color.text}`}>
                            {fila[año.toString()] as number || (
                              <span className="opacity-30">-</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className={`text-center font-semibold ${color.bg} ${color.text}`}>
                          {fila.total as number}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Fila de totales */}
                  <TableRow className="bg-gray-100 font-bold">
                    <TableCell className="sticky left-0 bg-gray-100 z-10">
                      TOTAL
                    </TableCell>
                    {data.resumenAnual.años.map((año) => (
                      <TableCell key={año} className="text-center">
                        {data.resumenAnual.totalesPorAño[año.toString()] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center bg-emerald-100 text-emerald-800">
                      {data.resumenAnual.totalGeneral}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay datos de entregas</p>
          )}
        </CardContent>
      </Card>

      {/* Sección B: Historial Detallado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Historial Detallado de Entregas
          </CardTitle>
          <CardDescription>
            {data.estadisticas.primeraEntrega && data.estadisticas.ultimaEntrega && (
              <span>
                Desde {data.estadisticas.primeraEntrega} hasta {data.estadisticas.ultimaEntrega}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.historial.length > 0 ? (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold w-[150px]">Fecha</TableHead>
                      <TableHead className="font-semibold">Producto</TableHead>
                      <TableHead className="font-semibold text-center w-[100px]">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistorial.map((item) => {
                      const color = getProductColor(item.producto);
                      return (
                        <TableRow key={item.id} className={`${color.bg} hover:opacity-90 transition-opacity`}>
                          <TableCell className={`${color.text} opacity-70`}>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 opacity-60" />
                              {item.fecha}
                            </div>
                          </TableCell>
                          <TableCell className={`font-semibold ${color.text}`}>
                            {item.producto}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={`${color.bg} ${color.text} border border-current border-opacity-20`}>
                              {item.cantidad}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`w-8 h-8 p-0 ${
                              currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                            }`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay historial de entregas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
