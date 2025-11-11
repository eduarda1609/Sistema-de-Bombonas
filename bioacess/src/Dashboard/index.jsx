import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Bell, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import BombonaCard from "../components/dashboard/BombonaCard";
import QRScanner from "../components/scanner/QRScanner";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "sujo", label: "Sujo" },
  { value: "limpo", label: "Limpo" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "com_cliente", label: "Com Cliente" },
];

const LOCATION_OPTIONS = [
  { value: "all", label: "Todas Localizações" },
  { value: "dirty_area", label: "Área Suja" },
  { value: "clean_area", label: "Área Limpa" },
  { value: "truck", label: "Caminhão" },
  { value: "client", label: "Cliente" },
];

export default function Dashboard() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBombona, setScannedBombona] = useState(null);

  const queryClient = useQueryClient();

  const { data: bombonas = [], isLoading } = useQuery({
    queryKey: ['bombonas'],
    queryFn: () => base44.entities.Bombona.list('-data_ultima_atualizacao'),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const handleQRScan = async (code) => {
    toast.loading("Buscando bombona...");
    
    try {
      const bombonasFiltradas = await base44.entities.Bombona.filter({ codigo_qr: code });
      
      if (bombonasFiltradas.length === 0) {
        toast.error("Bombona não encontrada com este código QR");
        return;
      }
      
      const bombona = bombonasFiltradas[0];
      setScannedBombona(bombona);
      toast.success(`Bombona ${bombona.numero_identificacao} encontrada!`);
      
      // Redirecionar para página de atualização ou abrir modal
      // Por enquanto apenas mostra a toast
    } catch (error) {
      toast.error("Erro ao buscar bombona");
    }
  };

  const filteredBombonas = bombonas.filter(b => {
    const statusMatch = filterStatus === "all" || b.status === filterStatus;
    const locationMatch = filterLocation === "all" || b.localizacao_atual?.toLowerCase().includes(filterLocation.replace('_', ' '));
    return statusMatch && locationMatch;
  });

  const userBombonas = filteredBombonas.filter(b => 
    b.responsavel_atual === user?.email || !b.responsavel_atual
  );

  const alertCount = bombonas.filter(b => {
    if (!b.data_ultima_atualizacao) return true;
    const hoursSince = (Date.now() - new Date(b.data_ultima_atualizacao).getTime()) / (1000 * 60 * 60);
    return hoursSince > 24;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Painel de Controle de Bombonas
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Escaneie códigos QR para atualizar status e localização em tempo real
            </p>
            <Button 
              onClick={() => setShowScanner(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg gap-2"
            >
              <QrCode className="w-5 h-5" />
              Escanear QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Setor
              </label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Alertas Pendentes</span>
                {alertCount > 0 && (
                  <Badge className="bg-orange-500 text-white ml-2">
                    {alertCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Notificações Ativas</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Marcar como Lidas
            </button>
          </div>
        </div>

        {/* Containers Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Suas Bombonas Atribuídas</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : userBombonas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">Nenhuma bombona atribuída</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {userBombonas.map((bombona) => (
                <BombonaCard key={bombona.id} bombona={bombona} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}