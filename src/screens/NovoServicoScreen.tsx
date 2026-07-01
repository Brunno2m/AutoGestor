import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Servico } from '../types';

// Configuração para exibir a notificação mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export default function NovoServicoScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [problema, setProblema] = useState('');
  
  const [permissaoCamera, solicitarPermissaoCamera] = useCameraPermissions();
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | undefined>();
  const [cameraRef, setCameraRef] = useState<any>(null);
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  const tirarFoto = async () => {
    if (cameraRef) {
      const foto = await cameraRef.takePictureAsync();
      setFotoUri(foto.uri);
      setCameraAtiva(false); // Fecha a câmera e volta pro formulário
    }
  };

  const salvarServico = async () => {
    if (!nome || !placa) {
      Alert.alert('Erro', 'Por favor, preencha o Nome e a Placa!');
      return;
    }

    try {
      // 1. Captura a localização atual (Recurso Nativo: Localização)
      const { status: statusLoc } = await Location.requestForegroundPermissionsAsync();
      let localizacao;
      if (statusLoc === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        localizacao = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }

      // 2. Monta o objeto tipado
      const novoServico: Servico = {
        id: Date.now().toString(),
        cliente: { id: Date.now().toString(), nome, telefone: '' },
        veiculoModelo: 'Modelo não especificado',
        veiculoPlaca: placa,
        descricaoProblema: problema,
        fotoAvariaUri: fotoUri,
        localizacaoResgate: localizacao,
        status: 'Pendente',
        dataEntrada: new Date().toISOString()
      };

      // 3. Salva no banco de dados local (AsyncStorage)
      const dadosAntigos = await AsyncStorage.getItem('@autogestor_servicos');
      const servicos = dadosAntigos ? JSON.parse(dadosAntigos) : [];
      servicos.push(novoServico);
      await AsyncStorage.setItem('@autogestor_servicos', JSON.stringify(servicos));

      // 4. Dispara a notificação local (Recurso Nativo: Notificação)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Novo Serviço Registrado! 🚗",
          body: `O veículo de placa ${placa} foi salvo com sucesso no sistema.`,
        },
        trigger: null, // Dispara na hora
      });

      // Limpa os campos e navega para o Dashboard
      setNome(''); setPlaca(''); setProblema(''); setFotoUri(undefined);
      Alert.alert('Sucesso', 'Serviço adicionado com sucesso!');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu uma falha ao salvar o serviço.');
    }
  };

  // Renderiza a Câmera se ela estiver ativada
  if (cameraAtiva) {
    if (!permissaoCamera?.granted) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={34} color="#0f766e" />
            <Text style={styles.permissionTitle}>Permissão da câmera</Text>
            <Text style={styles.permissionText}>Precisamos acessar a câmera para registrar a avaria do veículo.</Text>
            <Pressable style={styles.primaryAction} onPress={solicitarPermissaoCamera}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Conceder permissão</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }} ref={(ref) => setCameraRef(ref)} facing="back" />
        <View style={styles.cameraButtons}>
          <Pressable style={[styles.cameraAction, styles.cameraActionSecondary]} onPress={() => setCameraAtiva(false)}>
            <Ionicons name="close-outline" size={18} color="#fff" />
            <Text style={styles.cameraActionText}>Cancelar</Text>
          </Pressable>
          <Pressable style={styles.cameraAction} onPress={tirarFoto}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.cameraActionText}>Capturar foto</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Renderiza o Formulário padrão
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.heroCard, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="add-circle-outline" size={28} color="#a16207" />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Novo atendimento</Text>
          <Text style={styles.heroSubtitle}>Registre o cliente, a placa e a ocorrência com uma foto se necessário.</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.formCard, { opacity: intro, transform: [{ scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={16} color="#a16207" />
            <Text style={styles.label}>Nome do cliente</Text>
          </View>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Maria Oliveira" placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="car-sport-outline" size={16} color="#a16207" />
            <Text style={styles.label}>Placa do veículo</Text>
          </View>
          <TextInput style={styles.input} value={placa} onChangeText={setPlaca} placeholder="Ex: ABC-1234" autoCapitalize="characters" placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#a16207" />
            <Text style={styles.label}>Problema relatado</Text>
          </View>
          <TextInput style={[styles.input, styles.textArea]} value={problema} onChangeText={setProblema} placeholder="Descreva a avaria..." multiline numberOfLines={3} placeholderTextColor="#94a3b8" />
        </View>

        <Pressable style={styles.photoButton} onPress={() => setCameraAtiva(true)}>
          <Ionicons name={fotoUri ? 'camera-reverse-outline' : 'camera-outline'} size={18} color="#fff" />
          <Text style={styles.photoButtonText}>{fotoUri ? 'Tirar nova foto' : 'Abrir câmera para foto'}</Text>
        </Pressable>

        {fotoUri && (
          <View style={styles.previewCard}>
            <Image source={{ uri: fotoUri }} style={styles.imagemPreview} />
          </View>
        )}

        <View style={styles.salvarBtnContainer}>
          <Pressable style={styles.saveButton} onPress={salvarServico}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar cadastro</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, backgroundColor: '#e2e8f0' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#e2e8f0' },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  formGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe4f0',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  photoButton: {
    backgroundColor: '#a16207',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  photoButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  previewCard: {
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imagemPreview: { width: '100%', height: 240 },
  salvarBtnContainer: { marginTop: 18 },
  saveButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  permissionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  permissionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  permissionText: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22 },
  primaryAction: {
    marginTop: 8,
    backgroundColor: '#0f766e',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionText: { color: '#fff', fontWeight: '800' },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#000',
    gap: 12,
  },
  cameraAction: {
    flex: 1,
    backgroundColor: '#0f766e',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cameraActionSecondary: {
    backgroundColor: '#334155',
  },
  cameraActionText: { color: '#fff', fontWeight: '800' },
});