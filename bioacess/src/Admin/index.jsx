import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Clock, Download, FileText, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "sujo", label: "Sujo" },
  { value: "limpo", label: "Limpo" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "com_cliente", label: "Com Cliente" },
];

const LOCATION_OPTIONS = [
  { value: "all", label: "Todos Setores" },
  { value: "dirty_area", label: "Área Suja" },
  { value: "clean_area", label: "Área Limpa" },
  { value: "truck", label: "Caminhão" },
  { value: "client", label: "Cliente" },
];

const STATUS_CONFIG = {
  limpo: { label: "Limpo", color: "bg-green-500" },
  sujo: { label: "Sujo", color: "bg-blue-500" },
  em_transito: { label: "Em Trânsito", color: "bg-orange-500" },
  com_cliente: { label: "Com Cliente", color: "bg-purple-500" },
  manutencao: { label: "Manutenção", color: "bg-red-500" }
};

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [readStatus, setReadStatus] = useState("all");

  const { data: bombonas = [], isLoading } = useQuery({
    queryKey: ['bombonas'],
    queryFn: () => base44.entities.Bombona.list('-data_ultima_atualizacao'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const exportCSV = () => {
    try {
      const headers = ['ID da Bombona', 'Status', 'Setor', 'Detalhes Localização', 'Responsável', 'Última Atualização'];
      const rows = filteredBombonas.map(b => [
        b.numero_identificacao,
        STATUS_CONFIG[b.status]?.label || b.status,
        b.localizacao_atual?.split('-')[0]?.trim() || '',
        b.localizacao_atual || '',
        b.responsavel_atual || '',
        b.data_ultima_atualizacao ? format(new Date(b.data_ultima_atualizacao), "dd/MM/yyyy HH:mm") : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bombonas-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportPDF = () => {
    toast.info("Funcionalidade de exportação PDF será implementada");
  };

  const filteredBombonas = bombonas.filter(b => {
    const matchesSearch = 
      b.numero_identificacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.codigo_qr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesLocation = filterLocation === "all" || 
      b.localizacao_atual?.toLowerCase().includes(filterLocation.replace('_', ' '));
    const matchesUser = filterUser === "all" || b.responsavel_atual === filterUser;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesUser;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">
            Visão geral e gerenciamento de todas as bombonas com rastreamento em tempo real, histórico de movimentações e recursos de exportação.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filtrar e Buscar Bombonas</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pesquisa por Código ou QrCode da Bombona
              </label>
              <Input
                placeholder="Digite o código QR ou ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
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
                Setor de Localização
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* All Containers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Todas as Bombonas</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportCSV}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={exportPDF}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Containers Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredBombonas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-600">Nenhuma bombona encontrada</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBombonas.map((bombona) => {
                const statusConfig = STATUS_CONFIG[bombona.status] || STATUS_CONFIG.limpo;
                
                return (
                  <Card key={bombona.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-blue-600 rounded"></div>
                          </div>
                          <h3 className="font-bold text-gray-900">
                            {bombona.numero_identificacao}
                          </h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar Status</DropdownMenuItem>
                            <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${statusConfig.color} text-white border-0`}>
                          {statusConfig.label}
                        </Badge>
                        {bombona.localizacao_atual?.split('-')[0]?.trim() && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {bombona.localizacao_atual.split('-')[0].trim()}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{bombona.localizacao_atual || 'Não especificado'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{bombona.responsavel_atual?.split('@')[0] || 'Não atribuído'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {bombona.data_ultima_atualizacao
                              ? format(new Date(bombona.data_ultima_atualizacao), "dd/MM/yyyy HH:mm")
                              : 'Nunca'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 text-sm">
                          Ver Histórico
                        </Button>
                        <Button className="flex-1 text-sm bg-blue-600 hover:bg-blue-700">
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notificações do Sistema</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Usuário
              </label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Leitura
              </label>
              <Select value={readStatus} onValueChange={setReadStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma opção..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                  <SelectItem value="unread">Não Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Marcar como Lida
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
