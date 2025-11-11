import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AlertsList({ alerts, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Alertas</CardTitle>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-slate-600 text-sm">Nenhum alerta ativo</p>
            </div>
          ) : (
            alerts.map((bombona) => {
              const hoursSince = bombona.data_ultima_atualizacao
                ? Math.floor((Date.now() - new Date(bombona.data_ultima_atualizacao).getTime()) / (1000 * 60 * 60))
                : 999;

              return (
                <div key={bombona.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {bombona.numero_identificacao}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <p className="text-xs text-slate-600">
                          {bombona.data_ultima_atualizacao
                            ? `${hoursSince}h sem atualização`
                            : 'Nunca atualizada'}
                        </p>
                      </div>
                      {bombona.localizacao_atual && (
                        <p className="text-xs text-slate-500 mt-1">
                          {bombona.localizacao_atual}
                        </p>
                      )}
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