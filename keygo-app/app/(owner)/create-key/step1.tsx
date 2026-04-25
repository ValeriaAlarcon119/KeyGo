import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../../context/AuthContext';
import { storeService, Store } from '../../../services/store.service';
import KeyGoMap from '../../../components/common/KeyGoMap';

const { width } = Dimensions.get('window');

const C = {
  primary:  '#1E4FA3',
  yellow:   '#F4C430',
  bg:       '#F6F8FF',
  white:    '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#64748B',
};

const INITIAL_REGION = {
  latitude: 4.6097,
  longitude: -74.0817,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function SelectStore() {
  const { token } = useAuth();
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const [stores,          setStores]          = useState<Store[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const init = useCallback(async () => {
    if (!token) return;
    try {
      if (Platform.OS !== 'web') {
        await Location.requestForegroundPermissionsAsync();
      }
      const data = await storeService.getAll(token);
      setStores(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { init(); }, [init]);

  const handleContinue = () => {
    if (!selectedStoreId) return;
    // CORRECCIÓN: Apuntando a la ruta exacta
    router.push({
      pathname: '/(owner)/create-key/step2',
      params: { storeId: selectedStoreId }
    } as any);
  };

  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      {/* ── MAPA ── */}
      <KeyGoMap
        stores={stores}
        onSelectStore={setSelectedStoreId}
        selectedStoreId={selectedStoreId}
        initialRegion={INITIAL_REGION}
        mapRef={mapRef}
      />

      {/* ── HEADER CON FONDO PARA LEGIBILIDAD ── */}
      <SafeAreaView style={s.overlayTop}>
        <View style={s.headerCard}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.textDark} />
          </TouchableOpacity>
          <View style={s.titleBox}>
             <Text style={s.titleText}>Escoge el punto KeyGo</Text>
             <Text style={s.subtitleText}>donde deseas guardar la llave</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ── BOTTOM UI ── */}
      <View style={s.overlayBottom}>
        <View style={s.searchContainer}>
          <Ionicons name="search" size={20} color={C.textGray} style={{ marginRight: 10 }} />
          <TextInput 
            placeholder="Buscar zona o nombre..." 
            style={s.searchInput}
            placeholderTextColor={C.textGray}
          />
        </View>

        <TouchableOpacity 
          style={[s.continueBtn, !selectedStoreId && s.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedStoreId}
          activeOpacity={0.8}
        >
          <Text style={s.continueBtnText}>
            {selectedStoreId ? 'Continuar' : 'Selecciona un punto'}
          </Text>
          {selectedStoreId && <Ionicons name="arrow-forward" size={18} color={C.primary} />}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  overlayTop: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    zIndex: 10 
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBox: {
    flex: 1,
    marginLeft: 12,
  },
  titleText: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: C.textDark,
    lineHeight: 22,
  },
  subtitleText: { 
    fontSize: 13, 
    color: C.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  overlayBottom: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, 
    gap: 16 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.white, 
    borderRadius: 18, 
    paddingHorizontal: 16, 
    height: 56, 
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchInput: { flex: 1, color: C.textDark, fontWeight: '500' },
  continueBtn: { 
    backgroundColor: C.yellow, 
    height: 60, 
    borderRadius: 18, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: C.yellow,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    gap: 10,
  },
  continueBtnDisabled: { 
    backgroundColor: '#E2E8F0', 
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: { 
    fontSize: 17, 
    fontWeight: '900', 
    color: C.primary,
    letterSpacing: 0.5,
  },
  loader: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 20 
  },
});
