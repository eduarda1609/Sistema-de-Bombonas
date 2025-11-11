
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QrCode, MapPin, Truck as TruckIcon, Clock } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "sujo", label: "Sujo" },
  { value: "limpo", label: "Limpo" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "com_cliente", label: "Com Cliente" },
];

const STATUS_CONFIG = {
  limpo: { label: "Limpo", color: "bg-green-500" },
  sujo: { label: "Sujo", color: "bg-blue-500" },
  em_transito: { label: "Em Trânsito", color: "bg-orange-500" },
  com_cliente: { label: "Com Cliente", color: "bg-purple-500" },
  manutencao: { label: "Manutenção", color: "bg-red-500" }
};

export default function Transport() {
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: bombonas = [], isLoading } = useQuery({
    queryKey: ['bombonas'],
    queryFn: () => base44.entities.Bombona.list('-data_ultima_atualizacao'),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Filtrar bombonas em transporte do usuário atual
  const myTransportBombonas = bombonas.filter(b => {
    const isInTransit = b.status === 'em_transito';
    const isMine = b.responsavel_atual === user?.email;
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    
    return isInTransit && isMine && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Gerenciamento de Transporte</h1>
          <p className="text-lg text-blue-100">
            Gerencie bombonas em trânsito e atualize status de entrega de forma eficiente
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                0
              </Badge>
              <Button variant="outline" size="sm">
                Marcar como Lida
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <QrCode className="w-4 h-4" />
              Escanear QR para Entrega
            </Button>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
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
        </div>

        {/* Transport Containers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Bombonas em Transporte</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : myTransportBombonas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma bombona em transporte atribuída a você</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTransportBombonas.map((bombona) => {
                const statusConfig = STATUS_CONFIG[bombona.status];
                
                return (
                  <Card key={bombona.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">QR: {bombona.numero_identificacao}</p>
                          <Badge className={`${statusConfig.color} text-white border-0`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-900">
                            {bombona.localizacao_atual?.split('-').slice(1).join('-').trim() || 'Localização não especificada'}
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <TruckIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-900">
                            {bombona.localizacao_atual?.split('-')[0]?.trim() || 'Não especificado'}
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            Última atualização: {bombona.data_ultima_atualizacao
                              ? format(new Date(bombona.data_ultima_atualizacao), "dd/MM/yyyy HH:mm")
                              : 'Nunca'}
                          </p>
                        </div>
                      </div>

                      <Button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                        Atualizar Status
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
