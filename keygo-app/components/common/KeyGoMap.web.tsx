import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MapProps {
  stores: any[];
  onSelectStore: (id: string) => void;
  selectedStoreId: string | null;
  initialRegion: any;
  mapRef: any;
}

export default function KeyGoMapWeb({ stores, onSelectStore, selectedStoreId, initialRegion }: MapProps) {
  const parseCoords = (link?: string) => {
    if (!link) return null;
    const match = link.match(/q=([-.\d]+),([-.\d]+)/);
    return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
  };

  // Generamos los marcadores para Leaflet
  const markers = stores
    .map((s) => {
      const c = parseCoords(s.google_maps_link);
      if (!c) return null;
      return { ...c, id: s.id, name: s.store_name };
    })
    .filter(Boolean);

  // HTML embebido con Leaflet
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-pin {
          background: #1E4FA3;
          border: 3px solid #F4C430;
          border-radius: 50%;
          color: white;
          text-align: center;
          line-height: 32px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const markers = ${JSON.stringify(markers)};
        markers.forEach(m => {
          const marker = L.marker([m.lat, m.lng]).addTo(map);
          marker.on('click', () => {
            window.parent.postMessage({ type: 'SELECT_STORE', id: m.id }, '*');
          });
        });

        window.addEventListener('message', (e) => {
           if(e.data.type === 'CENTER_ON_USER') {
              // Lógica de centrado si fuera necesaria
           }
        });
      </script>
    </body>
    </html>
  `;

  // Escuchamos el mensaje del iframe
  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'SELECT_STORE') {
        onSelectStore(e.data.id);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectStore]);

  return (
    <View style={styles.container}>
      <iframe
        srcDoc={mapHtml}
        style={{ border: 'none', width: '100%', height: '100%' }}
        title="KeyGo Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
