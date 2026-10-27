import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { useDriverStore } from '../../store/useDriverStore';
import { DEFAULT_REGION } from '../../api/mockDrivers';
import { DriverMarker } from './components/DriverMarker';
import { UserPulseMarker } from './components/UserPulseMarker';
import { MAP_DARK_STYLE } from './styles/mapDarkStyle';
import { COLORS } from '../../theme/colors';
import { Driver } from '../../types/driver';

// Crosshair SVG for Re-center button
const CrosshairIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v3m0 14v3M2 12h3m14 0h3m-8-7a7 7 0 100 14 7 7 0 000-14z"
      stroke={COLORS.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MapRadarView: React.FC = () => {
  const mapRef = useRef<MapView>(null);

  // Zustand selectors (atomic subscriptions for performance)
  const drivers = useDriverStore(state => state.drivers);
  const selectedDriverId = useDriverStore(state => state.selectedDriverId);
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const selectDriver = useDriverStore(state => state.selectDriver);

  const filteredDrivers = useMemo(() => {
    if (selectedCategory === 'all') return drivers;
    return drivers.filter(d => d.type === selectedCategory);
  }, [drivers, selectedCategory]);

  // Smoothly center the map on the user's location
  const handleRecenter = useCallback(() => {
    mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
  }, []);

  // When a marker is pressed, center on it and update store
  const handleSelectDriver = useCallback(
    (driver: Driver) => {
      selectDriver(driver.id);
      mapRef.current?.animateToRegion(
        {
          latitude: driver.coordinate.latitude - 0.005, // Slight offset for bottom sheet clearance
          longitude: driver.coordinate.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        500
      );
    },
    [selectDriver]
  );

  // When filter changes, smoothly frame all matching drivers
  useEffect(() => {
    if (filteredDrivers.length > 0 && mapRef.current) {
      const coordinates = filteredDrivers.map(d => d.coordinate);
      coordinates.push({
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      });

      const timer = setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 60, bottom: 280, left: 60 },
          animated: true,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsCompass={false}
        showsScale={false}
        showsUserLocation={false}
        userInterfaceStyle="dark"
      >
        {/* User Current Location Radar Pulse */}
        <UserPulseMarker
          coordinate={{
            latitude: DEFAULT_REGION.latitude,
            longitude: DEFAULT_REGION.longitude,
          }}
        />

        {/* 60FPS Filterable Driver Markers */}
        {filteredDrivers.map(driver => (
          <DriverMarker
            key={driver.id}
            driver={driver}
            isSelected={driver.id === selectedDriverId}
            onSelect={handleSelectDriver}
          />
        ))}
      </MapView>

      {/* Floating Radar Header Badge */}
      <View style={styles.radarBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.radarBadgeText}>
          RADAR ACTIVE • {filteredDrivers.length} NEARBY
        </Text>
      </View>

      {/* Floating Re-center Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <CrosshairIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  radarBadge: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 18, 26, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.onlineGreen,
    marginRight: 8,
  },
  radarBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    top: 52,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(21, 24, 33, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
