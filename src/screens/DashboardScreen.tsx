import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, ScrollView, Image, Animated, Easing } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CardServico from '../components/CardServico';
import { obterServicos } from '../services/storage';
import { Servico } from '../types';

export default function DashboardScreen() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const navigation = useNavigation<any>();
  const intro = useRef(new Animated.Value(0)).current;

  const carregarServicos = useCallback(() => {
    obterServicos().then((dados) => {
      setServicos(dados.reverse());
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarServicos();
    }, [carregarServicos])
  );

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  const pendentes = servicos.filter((servico) => servico.status === 'Pendente').length;
  const emAndamento = servicos.filter((servico) => servico.status === 'Em Andamento').length;
  const concluidos = servicos.filter((servico) => servico.status === 'Concluido').length;

  const Header = () => (
    <Animated.View style={[styles.headerBlock, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="speedometer-outline" size={30} color="#a16207" />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Painel operacional</Text>
          <Text style={styles.heroSubtitle}>Visão rápida dos serviços e do fluxo da oficina.</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={carregarServicos}>
          <Ionicons name="refresh-outline" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Ionicons name="layers-outline" size={18} color="#a16207" />
          <Text style={styles.metricValue}>{servicos.length}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="alert-circle-outline" size={18} color="#a16207" />
          <Text style={styles.metricValue}>{pendentes}</Text>
          <Text style={styles.metricLabel}>Pendentes</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="checkmark-done-outline" size={18} color="#166534" />
          <Text style={styles.metricValue}>{concluidos}</Text>
          <Text style={styles.metricLabel}>Concluídos</Text>
        </View>
      </View>

      <View style={styles.statusStrip}>
        <Ionicons name="time-outline" size={16} color="#a16207" />
        <Text style={styles.statusText}>{emAndamento} em andamento neste momento</Text>
      </View>
    </Animated.View>
  );

  const DetalhesServico = () => {
    if (!servicoSelecionado) {
      return null;
    }

    const dataFormatada = new Date(servicoSelecionado.dataEntrada).toLocaleString('pt-BR');

    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setServicoSelecionado(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{servicoSelecionado.veiculoPlaca}</Text>
                <Text style={styles.modalSubtitle}>{servicoSelecionado.cliente.nome}</Text>
              </View>
              <Pressable style={styles.modalCloseButton} onPress={() => setServicoSelecionado(null)}>
                <Ionicons name="close-outline" size={20} color="#fff" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <View style={styles.modalStatusRow}>
                <Ionicons name="pulse-outline" size={16} color="#0f766e" />
                <Text style={styles.modalStatusText}>{servicoSelecionado.status}</Text>
              </View>

              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Problema relatado</Text>
                <Text style={styles.detailValue}>{servicoSelecionado.descricaoProblema || 'Sem descrição informada.'}</Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailPill}>
                  <Ionicons name="calendar-outline" size={16} color="#0f766e" />
                  <Text style={styles.detailPillText}>{dataFormatada}</Text>
                </View>

                <View style={styles.detailPill}>
                  <Ionicons name="person-outline" size={16} color="#0f766e" />
                  <Text style={styles.detailPillText}>{servicoSelecionado.cliente.nome}</Text>
                </View>
              </View>

              {servicoSelecionado.localizacaoResgate ? (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Localização cadastrada</Text>
                  <Text style={styles.detailValue}>
                    Lat {servicoSelecionado.localizacaoResgate.latitude.toFixed(5)} | Lon {servicoSelecionado.localizacaoResgate.longitude.toFixed(5)}
                  </Text>
                </View>
              ) : null}

              {servicoSelecionado.fotoAvariaUri ? (
                <View style={styles.photoBlock}>
                  <Text style={styles.detailLabel}>Foto da avaria</Text>
                  <Image source={{ uri: servicoSelecionado.fotoAvariaUri }} style={styles.detailImage} />
                </View>
              ) : null}

              <Pressable
                style={styles.modalAction}
                onPress={() => {
                  setServicoSelecionado(null);
                  navigation.navigate('Novo Serviço');
                }}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.modalActionText}>Registrar novo atendimento</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={Header}
        data={servicos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CardServico data={item} index={index} onPress={setServicoSelecionado} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-sport-outline" size={42} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Nenhum serviço cadastrado.</Text>
            <Text style={styles.emptyText}>Cadastre o primeiro atendimento para começar a acompanhar o fluxo.</Text>
            <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('Novo Serviço')}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Novo serviço</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacing} />}
      />

      <DetalhesServico />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e2e8f0' },
  listContent: { padding: 16, paddingBottom: 28 },
  headerBlock: { marginBottom: 12 },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: '#cbd5e1', marginTop: 4, lineHeight: 20 },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#a16207',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  metricLabel: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  statusStrip: {
    marginTop: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: { color: '#92400e', fontWeight: '700' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 12 },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emptyButton: {
    marginTop: 18,
    backgroundColor: '#a16207',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: { color: '#fff', fontWeight: '800' },
  footerSpacing: { height: 24 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.66)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    maxHeight: '86%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#0f172a',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalSubtitle: { color: '#cbd5e1', marginTop: 4 },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: 18, gap: 14 },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfeff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalStatusText: { color: '#155e75', fontWeight: '800' },
  detailBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
  detailValue: { fontSize: 15, color: '#0f172a', lineHeight: 22, fontWeight: '600' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailPill: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailPillText: { flex: 1, color: '#0f172a', fontWeight: '700' },
  photoBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailImage: { width: '100%', height: 220, borderRadius: 18, marginTop: 10 },
  modalAction: {
    backgroundColor: '#0f766e',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalActionText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});