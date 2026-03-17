"use client";

import { useState } from 'react';
import { Shield, Upload, Search, Database, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadForm } from '@/components/epp/UploadForm';
import { SearchPanel } from '@/components/epp/SearchPanel';
import { WorkerView } from '@/components/epp/WorkerView';
import { DashboardStats } from '@/components/epp/DashboardStats';
import { UserMenu } from '@/components/epp/UserMenu';

export default function HomePage() {
  const [selectedTrabajador, setSelectedTrabajador] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSelectTrabajador = (id: number) => {
    setSelectedTrabajador(id);
  };

  const handleBack = () => {
    setSelectedTrabajador(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/10">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">
                  Sistema de Gestión EPP
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Seguridad y Salud Ocupacional
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 italic">
                <Database className="h-4 w-4 text-emerald-500" />
                <span>Base de datos activa</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center gap-2 px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
            >
              <Search className="h-4 w-4" />
              Consultar Trabajador
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className="flex items-center gap-2 px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
            >
              <Upload className="h-4 w-4" />
              Cargar Datos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats />
          </TabsContent>

          {/* Tab: Búsqueda y Vista del Trabajador */}
          <TabsContent value="search" className="space-y-6">
            {selectedTrabajador ? (
              <WorkerView 
                trabajadorId={selectedTrabajador} 
                onBack={handleBack} 
              />
            ) : (
              <div className="max-w-2xl mx-auto">
                <SearchPanel onSelectTrabajador={handleSelectTrabajador} />
              </div>
            )}
          </TabsContent>

          {/* Tab: Carga de Datos */}
          <TabsContent value="upload" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <UploadForm />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Sistema de Gestión EPP - Departamento de SSO
            </p>
            <div className="flex items-center gap-4">
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <p>Control Interno de Seguridad</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
