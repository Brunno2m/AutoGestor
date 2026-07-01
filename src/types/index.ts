// src/types/index.ts

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string; // Opcional
}

export interface Localizacao {
  latitude: number;
  longitude: number;
}

export interface Servico {
  id: string;
  cliente: Cliente;
  veiculoModelo: string;
  veiculoPlaca: string;
  descricaoProblema: string;
  fotoAvariaUri?: string;
  localizacaoResgate?: Localizacao;
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
  dataEntrada: string;
}