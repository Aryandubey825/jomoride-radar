import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Driver } from '../../../types/driver';
import { COLORS } from '../../../theme/colors';

interface DriverListItemProps {
  driver: Driver;
  isSelected: boolean;
  onPress: (driver: Driver) => void;
}

export const DriverListItem: React.FC<DriverListItemProps> = ({
  driver,
  isSelected,
  onPress,
}) => {
  const isPremium = driver.type === 'premium';
  const tierColor = isPremium ? COLORS.premiumGold : COLORS.standardSilver;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isSelected && { borderColor: isPremium ? COLORS.premiumGold : COLORS.primary },
      ]}
      onPress={() => onPress(driver)}
      activeOpacity={0.7}
    >
      {/* Left: Driver Avatar with Tier Ring */}
      <View style={[styles.avatarWrapper, { borderColor: tierColor }]}>
        <Image source={{ uri: driver.avatar }} style={styles.avatar} />
      </View>

      {/* Middle: Driver Info */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {driver.name}
          </Text>
          <View style={[styles.tierTag, { backgroundColor: isPremium ? '#2A2207' : '#192030' }]}>
            <Text style={[styles.tierTagText, { color: tierColor }]}>
              {isPremium ? 'VIP' : 'STD'}
            </Text>
          </View>
        </View>

        <Text style={styles.carModel} numberOfLines={1}>
          {driver.carModel} • <Text style={styles.plate}>{driver.licensePlate}</Text>
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{driver.rating.toFixed(2)}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.etaText}>{driver.etaMinutes} min away</Text>
        </View>
      </View>

      {/* Right: Fare & Action */}
      <View style={styles.fareCol}>
        <Text style={styles.fareText}>{driver.fareEstimate}</Text>
        <Text style={styles.fixedLabel}>est. fare</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  selectedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
  },
  avatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  tierTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tierTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  carModel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  plate: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: COLORS.starYellow,
    fontSize: 12,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  dotSeparator: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginRight: 6,
  },
  etaText: {
    fontSize: 11,
    color: COLORS.onlineGreen,
    fontWeight: '600',
  },
  fareCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  fareText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  fixedLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
