import React from 'react';
import { View, StyleSheet } from 'react-native';
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
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        {/* Radar Wave Halo */}
        <View style={styles.radarHalo} />
        {/* Core Dot with White Border */}
        <View style={styles.outerRing}>
          <View style={styles.coreDot} />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarHalo: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  outerRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  coreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
});
