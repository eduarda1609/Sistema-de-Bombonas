
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Package, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRScanner from "../components/scanner/QRScanner";
import { toast } from "sonner";

export default function Confirmation() {
  const [showScanner, setShowScanner] = useState(false);

  const { data: bombonas = [] } = useQuery({
    queryKey: ['bombonas'],
    queryFn: () => base44.entities.Bombona.list('-data_ultima_atualizacao', 10),
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
      toast.success(`Bombona ${bombona.numero_identificacao} confirmada!`);
      
      // Aqui você pode adicionar lógica para confirmar recebimento
    } catch (error) {
      toast.error("Erro ao buscar bombona");
    }
  };

  const myBombonas = bombonas.filter(b => b.responsavel_atual === user?.email).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Confirmação de Recebimento de Bombonas
          </h1>
          <p className="text-lg text-blue-100">
            Escaneie códigos QR para confirmar o recebimento e gerenciar suas bombonas
          </p>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Scanner */}
          <div className="space-y-6">
            {/* Scan Card */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Escaneie o codigo do QrCode da Bombona
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Use a câmera do seu dispositivo para escanear o código QR da bombona e confirmar o recebimento
                </p>
                <Button 
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 py-6"
                >
                  <QrCode className="w-5 h-5" />
                  Escanear QR Code
                </Button>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Como Funciona
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      Escaneie o código QR da bombona entregue
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      Revise os detalhes da bombona e adicione observações se necessário
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-sm text-gray-700 pt-1">
                      Confirme o recebimento para atualizar o status da bombona
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - My Containers */}
          <div>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Minhas Bombonas
                  </h2>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700">
                    Ver Todas
                  </Button>
                </div>

                {myBombonas.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma bombona atribuída</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBombonas.map((bombona) => (
                      <div 
                        key={bombona.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {bombona.numero_identificacao}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {bombona.codigo_qr}
                              </p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            Atualizado
                          </Badge>
                          <span className="text-xs text-gray-600">
                            Pronto para Retirada
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
