import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_CONFIG = {
  limpo: { label: "Limpas", color: "#10b981" },
  sujo: { label: "Sujas", color: "#f97316" },
  em_transito: { label: "Em Trânsito", color: "#3b82f6" },
  com_cliente: { label: "Com Clientes", color: "#a855f7" },
  manutencao: { label: "Manutenção", color: "#ef4444" }
};

export default function StatusChart({ bombonas, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusCounts = bombonas.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.label,
    value: statusCounts[key] || 0,
    color: config.color
  }));

  return (
    <Card className="shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}