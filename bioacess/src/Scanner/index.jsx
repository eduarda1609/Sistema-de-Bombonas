import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Package, MapPin, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "limpo", label: "Limpa", color: "bg-green-500" },
  { value: "sujo", label: "Suja", color: "bg-orange-500" },
  { value: "em_transito", label: "Em Trânsito", color: "bg-blue-500" },
  { value: "com_cliente", label: "Com Cliente", color: "bg-purple-500" },
  { value: "manutencao", label: "Manutenção", color: "bg-red-500" }
];

export default function Scanner() {
  const [codigoQR, setCodigoQR] = useState("");
  const [bombonaEncontrada, setBombonaEncontrada] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    localizacao: "",
    cliente: "",
    observacoes: ""
  });
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const buscarBombonaMutation = useMutation({
    mutationFn: async (codigo) => {
      const bombonas = await base44.entities.Bombona.filter({ codigo_qr: codigo });
      if (bombonas.length === 0) throw new Error("Bombona não encontrada");
      return bombonas[0];
    },
    onSuccess: (bombona) => {
      setBombonaEncontrada(bombona);
      setFormData({
        status: bombona.status,
        localizacao: bombona.localizacao_atual || "",
        cliente: bombona.cliente_atual || "",
        observacoes: ""
      });
    },
    onError: () => {
      toast.error("Bombona não encontrada com este código QR");
    }
  });

  const atualizarBombonaMutation = useMutation({
    mutationFn: async (data) => {
      const statusAnterior = bombonaEncontrada.status;
      const localizacaoAnterior = bombonaEncontrada.localizacao_atual;

      // Atualizar bombona
      await base44.entities.Bombona.update(bombonaEncontrada.id, {
        status: data.status,
        localizacao_atual: data.localizacao,
        cliente_atual: data.cliente,
        responsavel_atual: user?.email,
        data_ultima_atualizacao: new Date().toISOString(),
        observacoes: data.observacoes
      });

      // Criar movimentação
      await base44.entities.Movimentacao.create({
        bombona_id: bombonaEncontrada.id,
        status_anterior: statusAnterior,
        status_novo: data.status,
        localizacao_anterior: localizacaoAnterior,
        localizacao_nova: data.localizacao,
        responsavel: user?.email,
        cliente: data.cliente,
        observacoes: data.observacoes,
        data_movimentacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bombonas'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      toast.success("Bombona atualizada com sucesso!");
      
      // Resetar formulário
      setCodigoQR("");
      setBombonaEncontrada(null);
      setFormData({ status: "", localizacao: "", cliente: "", observacoes: "" });
    }
  });

  const handleBuscar = () => {
    if (!codigoQR.trim()) {
      toast.error("Digite um código QR");
      return;
    }
    buscarBombonaMutation.mutate(codigoQR);
  };

  const handleAtualizar = () => {
    if (!formData.status) {
      toast.error("Selecione um status");
      return;
    }
    atualizarBombonaMutation.mutate(formData);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Scanner QR</h1>
          <p className="text-slate-600 mt-1">Escaneie ou digite o código QR da bombona</p>
        </div>

        {/* Scanner Section */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Localizar Bombona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código QR</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="codigo"
                  placeholder="Digite ou escaneie o código QR"
                  value={codigoQR}
                  onChange={(e) => setCodigoQR(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <Button 
                  onClick={handleBuscar}
                  disabled={buscarBombonaMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {buscarBombonaMutation.isPending ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>

            {bombonaEncontrada && (
              <Alert className="bg-green-50 border-green-200">
                <Package className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>{bombonaEncontrada.numero_identificacao}</strong> encontrada!
                  <br />
                  Status atual: {STATUS_OPTIONS.find(s => s.value === bombonaEncontrada.status)?.label}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Update Form */}
        {bombonaEncontrada && (
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Atualizar Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Novo Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="localizacao">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Localização Atual
                </Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: Depósito A, Caminhão 123, etc."
                  value={formData.localizacao}
                  onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                  className="mt-2"
                />
              </div>

              {formData.status === "com_cliente" && (
                <div>
                  <Label htmlFor="cliente">Nome do Cliente</Label>
                  <Input
                    id="cliente"
                    placeholder="Digite o nome do cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações relevantes..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAtualizar}
                disabled={atualizarBombonaMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 gap-2"
              >
                <Save className="w-4 h-4" />
                {atualizarBombonaMutation.isPending ? "Salvando..." : "Salvar Atualização"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}