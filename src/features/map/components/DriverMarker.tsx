import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { Driver } from '../../../types/driver';
import { COLORS } from '../../../theme/colors';

interface DriverMarkerProps {
  driver: Driver;
  isSelected: boolean;
  onSelect: (driver: Driver) => void;
}

// Car SVG icon for crisp vector rendering
const CarIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.4-1.8-1.1-2.3L18 8.5c-.6-.5-1.4-.8-2.2-.8H8.2c-.8 0-1.6.3-2.2.8L3.1 10.7C2.4 11.2 2 12.1 2 13v3c0 .6.4 1 1 1h2m14 0v2c0 .6-.4 1-1 1h-1c-.6 0-1-.4-1-1v-2m-10 0v2c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1v-2m14 0H5m14-5H5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DriverMarkerComponent: React.FC<DriverMarkerProps> = ({
  driver,
  isSelected,
  onSelect,
}) => {
  const isPremium = driver.type === 'premium';
  const accentColor = isPremium ? COLORS.premiumGold : COLORS.primary;

  return (
    <Marker
      coordinate={driver.coordinate}
      anchor={{ x: 0.5, y: 1 }}
      onPress={() => onSelect(driver)}
      tracksViewChanges={false}
    >
      <View style={[styles.container, isSelected && styles.selectedContainer]}>
        {/* Rating or Tier Badge */}
        <View style={[styles.badge, { backgroundColor: isPremium ? '#2A2207' : '#0B1C28' }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {isPremium ? '★ VIP' : `★ ${driver.rating.toFixed(1)}`}
          </Text>
        </View>

        {/* Avatar Pin with Glow Border */}
        <View
          style={[
            styles.avatarBubble,
            { borderColor: accentColor },
            isSelected && { borderColor: '#FFFFFF', borderWidth: 2.5 },
          ]}
        >
          <Image
            source={{ uri: driver.avatar }}
            style={styles.avatarImage}
          />

          {/* Mini Vehicle Badge at bottom-right of avatar */}
          <View style={[styles.carBadge, { backgroundColor: accentColor }]}>
            <CarIcon color={isPremium ? '#000000' : '#0B0D13'} />
          </View>
        </View>

        {/* Pin Triangle Pointer */}
        <View style={[styles.pointer, { borderTopColor: accentColor }]} />
      </View>
    </Marker>
  );
};

// Pure memoized marker - prevents re-renders when other markers update
export const DriverMarker = memo(DriverMarkerComponent, (prevProps, nextProps) => {
  return (
    prevProps.driver.id === nextProps.driver.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.driver.type === nextProps.driver.type &&
    prevProps.driver.coordinate.latitude === nextProps.driver.coordinate.latitude &&
    prevProps.driver.coordinate.longitude === nextProps.driver.coordinate.longitude
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 68,
  },
  selectedContainer: {
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  avatarBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: COLORS.surface,
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  carBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
