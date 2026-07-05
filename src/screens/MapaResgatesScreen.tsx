import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Easing, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Servico } from '../types';
import { WebView } from 'react-native-webview';

export default function MapaResgatesScreen() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [mapaCarregado, setMapaCarregado] = useState(false);
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
      setMapaCarregado(false);
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMapa();
    }, [])
  );

  // Define uma região inicial fixa para evitar dependência de GPS na abertura da aba
  const markers = servicos
    .filter(
      (servico) =>
        servico.localizacaoResgate &&
        Number.isFinite(servico.localizacaoResgate.latitude) &&
        Number.isFinite(servico.localizacaoResgate.longitude)
    )
    .map((servico) => ({
      id: servico.id,
      latitude: servico.localizacaoResgate!.latitude,
      longitude: servico.localizacaoResgate!.longitude,
      title: `Veículo: ${servico.veiculoPlaca}`,
      description: servico.descricaoProblema,
    }));

  const mapaHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e2e8f0; }
          .leaflet-popup-content { font-family: Arial, sans-serif; margin: 12px; }
        </style>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const markers = ${JSON.stringify(markers)};
          const map = L.map('map', { zoomControl: true }).setView([-15.793889, -47.882778], 4);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          if (markers.length > 0) {
            const bounds = [];
            markers.forEach((marker) => {
              const leafMarker = L.marker([marker.latitude, marker.longitude]).addTo(map);
              leafMarker.bindPopup('<b>' + marker.title + '</b><br />' + (marker.description || 'Sem descrição'));
              bounds.push([marker.latitude, marker.longitude]);
            });
            map.fitBounds(bounds, { padding: [32, 32] });
          }
        </script>
      </body>
    </html>
  `;

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

      <View style={styles.mapContainer}>
        {!mapaCarregado && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#a16207" />
            <Text style={styles.loadingText}>Carregando mapa...</Text>
          </View>
        )}
        <WebView
          source={{ html: mapaHtml }}
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={() => setMapaCarregado(true)}
        />
      </View>
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
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  loadingText: {
    marginTop: 12,
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
});