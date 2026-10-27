import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FilterCategory } from '../../../types/driver';
import { COLORS } from '../../../theme/colors';

interface CategoryPillsProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  counts: {
    all: number;
    standard: number;
    premium: number;
  };
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const pills: { key: FilterCategory; label: string; count: number; accent: string }[] = [
    { key: 'all', label: 'All Fleet', count: counts.all, accent: COLORS.textPrimary },
    { key: 'standard', label: 'Standard', count: counts.standard, accent: COLORS.standardSilver },
    { key: 'premium', label: '★ Premium', count: counts.premium, accent: COLORS.premiumGold },
  ];

  return (
    <View style={styles.container}>
      {pills.map(pill => {
        const isActive = selectedCategory === pill.key;
        return (
          <TouchableOpacity
            key={pill.key}
            style={[
              styles.pill,
              isActive && styles.pillActive,
              isActive && { borderColor: pill.accent },
            ]}
            onPress={() => onSelectCategory(pill.key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? pill.accent : COLORS.textSecondary },
                isActive && styles.labelActive,
              ]}
            >
              {pill.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  { color: isActive ? COLORS.textPrimary : COLORS.textMuted },
                ]}
              >
                {pill.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  pillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
