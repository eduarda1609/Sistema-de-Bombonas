import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  limpo: { label: "Limpa", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
  sujo: { label: "Suja", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50" },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  com_cliente: { label: "Com Cliente", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
  manutencao: { label: "Manutenção", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" }
};

export default function RecentActivity({ movimentacoes, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movimentacoes.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhuma movimentação recente</p>
            </div>
          ) : (
            movimentacoes.map((mov) => {
              const statusAnteriorConfig = STATUS_CONFIG[mov.status_anterior] || STATUS_CONFIG.limpo;
              const statusNovoConfig = STATUS_CONFIG[mov.status_novo] || STATUS_CONFIG.limpo;

              return (
                <div key={mov.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-900">
                          Bombona ID: {mov.bombona_id.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${statusAnteriorConfig.bgLight} ${statusAnteriorConfig.textColor} border-0`}>
                          {statusAnteriorConfig.label}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <Badge className={`${statusNovoConfig.bgLight} ${statusNovoConfig.textColor} border-0`}>
                          {statusNovoConfig.label}
                        </Badge>
                      </div>

                      {mov.localizacao_nova && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {mov.localizacao_nova}
                        </div>
                      )}

                      {mov.responsavel && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                          <User className="w-3 h-3" />
                          {mov.responsavel}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {format(new Date(mov.created_date), "dd/MM/yy", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(mov.created_date), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}