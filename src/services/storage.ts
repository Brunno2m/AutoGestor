// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Servico } from '../types';

const CHAVE_STORAGE = '@autogestor_servicos';

export const salvarServico = async (novoServico: Servico): Promise<boolean> => {
  try {
    const servicosAtuais = await obterServicos();
    const novaLista = [...servicosAtuais, novoServico];
    await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(novaLista));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no AsyncStorage:', error);
    return false;
  }
};

export const obterServicos = async (): Promise<Servico[]> => {
  try {
    const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error('Erro ao ler do AsyncStorage:', error);
    return [];
  }
};

export const limparTodosServicos = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAVE_STORAGE);
  } catch (error) {
    console.error('Erro ao limpar storage:', error);
  }
};