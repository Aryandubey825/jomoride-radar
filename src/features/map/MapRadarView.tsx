import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { useDriverStore } from '../../store/useDriverStore';
import { DEFAULT_REGION } from '../../api/mockDrivers';
import { DriverMarker } from './components/DriverMarker';
import { UserPulseMarker } from './components/UserPulseMarker';
import { MAP_DARK_STYLE } from './styles/mapDarkStyle';
import { COLORS } from '../../theme/colors';
import { Driver } from '../../types/driver';

// Sleek Apple Maps Navigation Arrow Icon
const NavigationIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11l19-9-9 19-2-8-8-2z"
      stroke={COLORS.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(10, 132, 255, 0.25)"
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
  const bookingStatus = useDriverStore(state => state.bookingStatus);
  const matchedDriver = useDriverStore(state => state.matchedDriver);
  const bookingMode = useDriverStore(state => state.bookingMode);

  const filteredDrivers = useMemo(() => {
    if (selectedCategory === 'all') return drivers;
    return drivers.filter(d => d.type === selectedCategory);
  }, [drivers, selectedCategory]);

  // Smoothly zoom in and center in the VISIBLE viewport (above the bottom sheet)
  const handleRecenter = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: DEFAULT_REGION.latitude - 0.0048, // Offset so marker is centered in open visible map
        longitude: DEFAULT_REGION.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      600
    );
  }, []);

  // When a marker is pressed, center on it in the visible space
  const handleSelectDriver = useCallback(
    (driver: Driver) => {
      selectDriver(driver.id);
      mapRef.current?.animateToRegion(
        {
          latitude: driver.coordinate.latitude - 0.0048,
          longitude: driver.coordinate.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    },
    [selectDriver]
  );

  // When filter changes, smoothly frame all matching drivers in the visible area
  useEffect(() => {
    if (filteredDrivers.length > 0 && mapRef.current) {
      const coordinates = filteredDrivers.map(d => d.coordinate);
      coordinates.push({
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      });

      const timer = setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          // Bottom padding 400px ensures markers stay above the bottom sheet!
          edgePadding: { top: 120, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

  // When chauffeur is confirmed for instant dispatch, smoothly frame both the chauffeur and the user!
  useEffect(() => {
    if (bookingStatus === 'confirmed' && matchedDriver && mapRef.current) {
      if (bookingMode === 'now') {
        mapRef.current.fitToCoordinates(
          [
            matchedDriver.coordinate,
            {
              latitude: DEFAULT_REGION.latitude,
              longitude: DEFAULT_REGION.longitude,
            },
          ],
          {
            edgePadding: { top: 120, right: 60, bottom: 420, left: 60 },
            animated: true,
          }
        );
      } else {
        // Scheduled booking waiting for pickup: keep map centered calmly on user pickup area
        mapRef.current.animateToRegion(
          {
            latitude: DEFAULT_REGION.latitude - 0.0048,
            longitude: DEFAULT_REGION.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
      }
    }
  }, [bookingStatus, matchedDriver, bookingMode]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: DEFAULT_REGION.latitude - 0.0048,
          longitude: DEFAULT_REGION.longitude,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        }}
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

        {/* 60FPS Spring Animated Pop-up / Pop-down Driver Markers */}
        {drivers.map(driver => (
          <DriverMarker
            key={driver.id}
            driver={driver}
            isVisible={selectedCategory === 'all' || driver.type === selectedCategory}
            isSelected={driver.id === selectedDriverId}
            onSelect={handleSelectDriver}
          />
        ))}

        {/* Live Route Polyline connecting matched chauffeur to user (instant dispatch only) */}
        {bookingStatus === 'confirmed' &&
          matchedDriver &&
          bookingMode === 'now' && (
            <Polyline
              coordinates={[
                {
                  latitude: matchedDriver.coordinate.latitude,
                  longitude: matchedDriver.coordinate.longitude,
                },
                {
                  latitude: DEFAULT_REGION.latitude,
                  longitude: DEFAULT_REGION.longitude,
                },
              ]}
              strokeColor={COLORS.primary}
              strokeWidth={3.5}
              lineDashPattern={[0]}
            />
          )}
      </MapView>

      {/* Floating Re-center Button (Top-Right) */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <NavigationIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    top: 56,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(21, 24, 33, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(10, 132, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
