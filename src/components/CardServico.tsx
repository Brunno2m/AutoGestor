// src/components/CardServico.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Servico } from '../types';

interface Props {
  data: Servico;
  index?: number;
  onPress?: (servico: Servico) => void;
}

export default function CardServico({ data, index = 0, onPress }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 420,
      delay: index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const statusConfig =
    data.status === 'Concluido'
      ? { backgroundColor: '#dcfce7', color: '#166534', icon: 'checkmark-circle-outline' as const }
      : data.status === 'Em Andamento'
        ? { backgroundColor: '#fff7ed', color: '#9a3412', icon: 'time-outline' as const }
        : { backgroundColor: '#fef3c7', color: '#a16207', icon: 'alert-circle-outline' as const };

  const cardContent = (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.plateBadge}>
          <Ionicons name="car-sport-outline" size={16} color="#0f172a" />
          <Text style={styles.title}>{data.veiculoPlaca}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusConfig.backgroundColor }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.badgeText, { color: statusConfig.color }]}>{data.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#475569" />
        <Text style={styles.text}>
          <Text style={styles.bold}>Cliente:</Text> {data.cliente.nome}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="construct-outline" size={16} color="#475569" />
        <Text style={styles.text} numberOfLines={2}>
          <Text style={styles.bold}>Problema:</Text> {data.descricaoProblema}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerChip}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.data}>{new Date(data.dataEntrada).toLocaleDateString('pt-BR')}</Text>
        </View>

        {data.fotoAvariaUri ? (
          <View style={styles.footerChip}>
            <Ionicons name="camera-outline" size={14} color="#0f766e" />
            <Text style={styles.photoText}>Foto registrada</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={() => onPress?.(data)} style={({ pressed }) => [styles.pressableWrap, pressed && styles.pressed]}>
        {cardContent}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressableWrap: {
    borderRadius: 20,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 14,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    borderTopColor: '#d4a95f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a', letterSpacing: 0.4 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  text: { fontSize: 15, color: '#475569', flex: 1, lineHeight: 21 },
  bold: { fontWeight: '700', color: '#0f172a' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
    flexWrap: 'wrap',
  },
  footerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  data: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  photoText: { fontSize: 12, color: '#a16207', fontWeight: '700' },
});