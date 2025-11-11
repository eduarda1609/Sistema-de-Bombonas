
import Bombona from './Bombona.jsx'
import React from 'react'


export const bombona = {
  codigo_qr: "", 
  numero_identificacao: "", 
  status: "limpo", 
  localizacao_atual: "", 
  responsavel_atual: "", 
  cliente_atual: "", 
  capacidade: 0, 
  data_ultima_atualizacao: new Date().toISOString(), 
  observacoes: "", 
};


export const STATUS_BOMBONA = [
  "limpo",
  "sujo",
  "em_transito",
  "com_cliente",
  "manutencao",
];
