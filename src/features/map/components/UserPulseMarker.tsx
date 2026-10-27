import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Coordinate } from '../../../types/driver';
import { COLORS } from '../../../theme/colors';

interface UserPulseMarkerProps {
  coordinate: Coordinate;
}

export const UserPulseMarker: React.FC<UserPulseMarkerProps> = ({ coordinate }) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.8 }}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        {/* "YOU ARE HERE" Location Badge */}
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>YOU</Text>
        </View>

        {/* Pulse Halo */}
        <View style={styles.radarHalo} />

        {/* Core Location Ring */}
        <View style={styles.outerRing}>
          <View style={styles.coreDot} />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  userBadgeText: {
    color: '#0B0D13',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  radarHalo: {
    position: 'absolute',
    bottom: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.6)',
  },
  outerRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },
  coreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});
