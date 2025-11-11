
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, QrCode } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG = {
  limpo: { label: "Limpo", color: "bg-green-500" },
  sujo: { label: "Sujo", color: "bg-blue-500" },
  em_transito: { label: "Em Trânsito", color: "bg-orange-500" },
  com_cliente: { label: "Com Cliente", color: "bg-purple-500" },
  manutencao: { label: "Manutenção", color: "bg-red-500" }
};

export default function BombonaCard({ bombona }) {
  const statusConfig = STATUS_CONFIG[bombona.status] || STATUS_CONFIG.limpo;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 rounded"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {bombona.numero_identificacao}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Eye className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <Badge className={`${statusConfig.color} text-white border-0 px-4 py-1 text-sm font-medium`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Setor</span>
          <span className="font-medium text-gray-900">
            {bombona.localizacao_atual?.split('-')[0]?.trim() || 'Não Definido'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Detalhes Localização</span>
          <span className="font-medium text-gray-900">
            {bombona.localizacao_atual || 'Não especificado'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Responsável</span>
          <span className="font-medium text-gray-900">
            {bombona.responsavel_atual?.split('@')[0] || 'Não atribuído'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Última Atualização</span>
          <span className="font-medium text-gray-900">
            {bombona.data_ultima_atualizacao
              ? format(new Date(bombona.data_ultima_atualizacao), "dd/MM/yyyy HH:mm")
              : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
          Editar Status
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <QrCode className="w-4 h-4 mr-2" />
          Escanear
        </Button>
      </div>
    </Card>
  );
}
