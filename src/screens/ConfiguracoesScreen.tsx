import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { limparTodosServicos } from '../services/storage';

export default function ConfiguracoesScreen() {
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  const handleLimparDados = () => {
    Alert.alert(
      'Atenção',
      'Tem certeza que deseja apagar todos os serviços cadastrados? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await limparTodosServicos();
            Alert.alert('Sucesso', 'Todos os dados foram apagados.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.heroCard, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="settings-outline" size={28} color="#a16207" />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Ajustes do aplicativo</Text>
          <Text style={styles.heroSubtitle}>Gerencie os dados locais e confira as informações da versão.</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trash-outline" size={18} color="#a16207" />
          <Text style={styles.title}>Gerenciamento de dados</Text>
        </View>
        <Text style={styles.description}>
          Utilize o botão abaixo para limpar o banco de dados local do aplicativo. Ideal para resetar o sistema antes de novas apresentações ou testes.
        </Text>

        <Pressable style={styles.dangerButton} onPress={handleLimparDados}>
          <Ionicons name="warning-outline" size={18} color="#fff" />
          <Text style={styles.dangerButtonText}>Limpar todos os serviços</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={18} color="#a16207" />
          <Text style={styles.title}>Sobre o aplicativo</Text>
        </View>
        <Text style={styles.description}>AutoGestor v1.0.0</Text>
        <Text style={styles.description}>
          Desenvolvido para auxiliar no gerenciamento de oficinas mecânicas e socorro automotivo.
        </Text>
        <View style={styles.infoPill}>
          <Ionicons name="phone-portrait-outline" size={14} color="#a16207" />
          <Text style={styles.infoPillText}>Interface adaptada para celular</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e2e8f0',
  },
  heroCard: {
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: '#cbd5e1', marginTop: 4, lineHeight: 20 },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  description: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 14,
    lineHeight: 22,
  },
  dangerButton: {
    backgroundColor: '#a16207',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  infoPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  infoPillText: { color: '#92400e', fontWeight: '700', fontSize: 13 },
});