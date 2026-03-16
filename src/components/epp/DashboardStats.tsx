'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
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

interface EstadisticasData {
  resumen: {
    totalTrabajadores: number;
    totalEntregas: number;
    totalUnidades: number;
    productosUnicos: number;
  };
  productosTop: {
    producto: string;
    cantidad: number;
    entregas: number;
  }[];
  entregasPorAño: {
    año: number;
    entregas: number;
    unidades: number;
  }[];
  ultimasEntregas: {
    fecha: string;
    producto: string;
    cantidad: number;
    trabajador: {
      idPersona: number;
      nombre: string;
    };
  }[];
  trabajadoresActivos: {
    idPersona: number;
    nombre: string;
    entregas: number;
    unidades: number;
  }[];
}

export function DashboardStats() {
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/estadisticas');
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-700">{data.resumen.totalTrabajadores}</p>
                <p className="text-sm text-emerald-600">Trabajadores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-700">{data.resumen.totalEntregas}</p>
                <p className="text-sm text-blue-600">Entregas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-700">{data.resumen.totalUnidades.toLocaleString()}</p>
                <p className="text-sm text-amber-600">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-700">{data.resumen.productosUnicos}</p>
                <p className="text-sm text-purple-600">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Productos más entregados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-emerald-600" />
              Productos Más Entregados
            </CardTitle>
            <CardDescription>Top 10 productos por cantidad de unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {data.productosTop.length > 0 ? (
              <div className="space-y-2">
                {data.productosTop.map((p, idx) => (
                  <div key={p.producto} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">{p.producto}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {p.cantidad} uds
                      </Badge>
                      <span className="text-xs text-gray-500">{p.entregas} entregas</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Entregas por Año */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Entregas por Año
            </CardTitle>
            <CardDescription>Resumen anual de entregas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.entregasPorAño.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Año</TableHead>
                    <TableHead className="font-semibold text-center">Entregas</TableHead>
                    <TableHead className="font-semibold text-center">Unidades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.entregasPorAño.map((e) => (
                    <TableRow key={e.año} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{e.año}</TableCell>
                      <TableCell className="text-center">{e.entregas}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {e.unidades.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de contenido */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Últimas Entregas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-emerald-600" />
              Últimas Entregas Registradas
            </CardTitle>
            <CardDescription>Las 5 entregas más recientes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.ultimasEntregas.length > 0 ? (
              <div className="space-y-3">
                {data.ultimasEntregas.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50">
                    <div>
                      <p className="font-medium text-gray-800">{e.trabajador.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Código: {e.trabajador.idPersona} • {e.fecha}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{e.producto}</p>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {e.cantidad} uds
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay entregas recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Trabajadores más activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-emerald-600" />
              Trabajadores con Más Entregas
            </CardTitle>
            <CardDescription>Top 10 trabajadores por número de entregas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.trabajadoresActivos.length > 0 ? (
              <div className="space-y-2">
                {data.trabajadoresActivos.map((t, idx) => (
                  <div key={t.idPersona} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{t.nombre}</p>
                        <p className="text-xs text-gray-500">Código: {t.idPersona}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {t.entregas} entregas
                      </Badge>
                      <span className="text-xs text-gray-500">{t.unidades} uds</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
