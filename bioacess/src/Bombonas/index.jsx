import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, MapPin, User, Clock, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_CONFIG = {
  limpo: { label: "Limpa", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
  sujo: { label: "Suja", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50" },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  com_cliente: { label: "Com Cliente", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
  manutencao: { label: "Manutenção", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" }
};

export default function Bombonas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedBombona, setSelectedBombona] = useState(null);
  const [newBombona, setNewBombona] = useState({
    numero_identificacao: "",
    capacidade: "",
    status: "limpo"
  });

  const queryClient = useQueryClient();

  const { data: bombonas = [], isLoading } = useQuery({
    queryKey: ['bombonas'],
    queryFn: () => base44.entities.Bombona.list('-created_date'),
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-bombona', selectedBombona?.id],
    queryFn: () => selectedBombona 
      ? base44.entities.Movimentacao.filter({ bombona_id: selectedBombona.id }, '-created_date')
      : Promise.resolve([]),
    enabled: !!selectedBombona,
  });

  const addBombonaMutation = useMutation({
    mutationFn: async (data) => {
      const codigoQR = `BOM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return base44.entities.Bombona.create({
        codigo_qr: codigoQR,
        numero_identificacao: data.numero_identificacao,
        capacidade: parseFloat(data.capacidade),
        status: data.status,
        data_ultima_atualizacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bombonas'] });
      toast.success("Bombona cadastrada com sucesso!");
      setShowAddDialog(false);
      setNewBombona({ numero_identificacao: "", capacidade: "", status: "limpo" });
    }
  });

  const filteredBombonas = bombonas.filter(b => {
    const matchesSearch = b.numero_identificacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.codigo_qr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Bombonas</h1>
            <p className="text-slate-600 mt-1">Gerenciamento de todas as bombonas</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg gap-2">
                <Plus className="w-5 h-5" />
                Cadastrar Bombona
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Bombona</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Número de Identificação</Label>
                  <Input
                    placeholder="Ex: BOM-001"
                    value={newBombona.numero_identificacao}
                    onChange={(e) => setNewBombona({...newBombona, numero_identificacao: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Capacidade (litros)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 20"
                    value={newBombona.capacidade}
                    onChange={(e) => setNewBombona({...newBombona, capacidade: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Status Inicial</Label>
                  <Select value={newBombona.status} onValueChange={(v) => setNewBombona({...newBombona, status: v})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => addBombonaMutation.mutate(newBombona)}
                  disabled={addBombonaMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {addBombonaMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-md border-none">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Buscar por número ou código QR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bombonas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="shadow-md border-none">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredBombonas.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhuma bombona encontrada</p>
            </div>
          ) : (
            filteredBombonas.map((bombona) => {
              const statusConfig = STATUS_CONFIG[bombona.status];
              return (
                <Card 
                  key={bombona.id} 
                  className="shadow-md border-none hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedBombona(bombona)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{bombona.numero_identificacao}</CardTitle>
                      <Badge className={`${statusConfig.bgLight} ${statusConfig.textColor} border-0`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Package className="w-4 h-4" />
                      <span className="font-mono text-xs">{bombona.codigo_qr}</span>
                    </div>
                    {bombona.localizacao_atual && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {bombona.localizacao_atual}
                      </div>
                    )}
                    {bombona.responsavel_atual && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        {bombona.responsavel_atual}
                      </div>
                    )}
                    {bombona.data_ultima_atualizacao && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        {format(new Date(bombona.data_ultima_atualizacao), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Details Dialog */}
        {selectedBombona && (
          <Dialog open={!!selectedBombona} onOpenChange={() => setSelectedBombona(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico - {selectedBombona.numero_identificacao}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {movimentacoes.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">Nenhuma movimentação registrada</p>
                ) : (
                  movimentacoes.map((mov) => {
                    const statusConfig = STATUS_CONFIG[mov.status_novo];
                    return (
                      <div key={mov.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${statusConfig.bgLight} ${statusConfig.textColor} border-0`}>
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {format(new Date(mov.created_date), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        {mov.localizacao_nova && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                            <MapPin className="w-4 h-4" />
                            {mov.localizacao_nova}
                          </div>
                        )}
                        {mov.responsavel && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <User className="w-4 h-4" />
                            {mov.responsavel}
                          </div>
                        )}
                        {mov.observacoes && (
                          <p className="text-sm text-slate-600 mt-2 italic">{mov.observacoes}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}