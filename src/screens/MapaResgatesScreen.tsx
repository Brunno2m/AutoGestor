import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Easing } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Servico } from '../types';

export default function MapaResgatesScreen() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [localAtual, setLocalAtual] = useState<{ latitude: number; longitude: number } | null>(null);
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  const carregarMapa = async () => {
    try {
      // 1. Busca serviços salvos
      const dados = await AsyncStorage.getItem('@autogestor_servicos');
      if (dados) {
        setServicos(JSON.parse(dados));
      }

      // 2. Pede permissão e busca o local atual do dispositivo para centralizar o mapa
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocalAtual({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMapa();
    }, [])
  );

  // Define a região inicial. Se não tiver o GPS, centraliza em um ponto genérico (Brasil)
  const initialRegion = {
    latitude: localAtual?.latitude || -15.793889,
    longitude: localAtual?.longitude || -47.882778,
    latitudeDelta: localAtual ? 0.05 : 30, // Zoom mais próximo se tiver a localização
    longitudeDelta: localAtual ? 0.05 : 30,
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerOverlay, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="map-outline" size={18} color="#a16207" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Mapa de resgates</Text>
              <Text style={styles.headerSubtitle}>{servicos.length} ocorrências geolocalizadas</Text>
            </View>
            <Pressable style={styles.refreshButton} onPress={carregarMapa}>
              <Ionicons name="refresh-outline" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={true}>
        {servicos.map((servico) => {
          if (servico.localizacaoResgate) {
            return (
              <Marker
                key={servico.id}
                coordinate={{
                  latitude: servico.localizacaoResgate.latitude,
                  longitude: servico.localizacaoResgate.longitude,
                }}
                title={`Veículo: ${servico.veiculoPlaca}`}
                description={servico.descricaoProblema}
                pinColor="#ef4444" // Cor vermelha para destacar
              />
            );
          }
          return null;
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e2e8f0' },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  headerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: '#cbd5e1', marginTop: 2, fontSize: 13 },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#a16207',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: { width: '100%', height: '100%' },
});