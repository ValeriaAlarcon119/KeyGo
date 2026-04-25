import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface MapProps {
  stores: any[];
  onSelectStore: (id: string) => void;
  selectedStoreId: string | null;
  initialRegion: any;
  mapRef: any;
}

const C = {
  primary: '#1E4FA3',
  yellow: '#F4C430',
  white: '#FFFFFF',
};

export default function KeyGoMap({ stores, onSelectStore, selectedStoreId, initialRegion, mapRef }: MapProps) {
  const parseCoords = (link?: string) => {
    if (!link) return null;
    const match = link.match(/q=([-.\d]+),([-.\d]+)/);
    return match ? { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) } : null;
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      provider={PROVIDER_GOOGLE}
    >
      {stores.map((store) => {
        const coords = parseCoords(store.google_maps_link);
        if (!coords) return null;
        const isSelected = store.id === selectedStoreId;

        return (
          <Marker
            key={store.id}
            coordinate={coords}
            onPress={() => onSelectStore(store.id)}
          >
            <View style={styles.pinOuter}>
              <View style={[styles.pinInner, isSelected && styles.pinInnerSelected]}>
                <Ionicons name="key" size={14} color={isSelected ? C.white : C.primary} />
              </View>
              <View style={[styles.pinPointer, isSelected && styles.pinPointerSelected]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pinOuter: { alignItems: 'center' },
  pinInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 3,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInnerSelected: { backgroundColor: C.primary, borderColor: C.yellow },
  pinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: C.primary,
    marginTop: -4,
  },
  pinPointerSelected: { borderTopColor: C.yellow },
});
