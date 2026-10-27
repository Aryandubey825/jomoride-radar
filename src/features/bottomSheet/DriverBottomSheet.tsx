import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useDriverStore } from '../../store/useDriverStore';
import { CategoryPills } from './components/CategoryPills';
import { DriverListItem } from './components/DriverListItem';
import { COLORS } from '../../theme/colors';
import { Driver, FilterCategory } from '../../types/driver';

export const DriverBottomSheet: React.FC = () => {
  // Snap points for Bottom Sheet:
  // 16% = Peek bar (category selector visible)
  // 45% = Half sheet (quick browsing)
  // 85% = Full expanded sheet
  const snapPoints = useMemo(() => ['16%', '45%', '85%'], []);

  // Zustand Store bindings
  const drivers = useDriverStore(state => state.drivers);
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const selectedDriverId = useDriverStore(state => state.selectedDriverId);
  const setCategory = useDriverStore(state => state.setCategory);
  const selectDriver = useDriverStore(state => state.selectDriver);

  // Reactive filtered drivers computation
  const filteredDrivers = useMemo(() => {
    if (selectedCategory === 'all') return drivers;
    return drivers.filter(d => d.type === selectedCategory);
  }, [drivers, selectedCategory]);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  // Compute driver counts dynamically
  const counts = useMemo(
    () => ({
      all: drivers.length,
      standard: drivers.filter(d => d.type === 'standard').length,
      premium: drivers.filter(d => d.type === 'premium').length,
    }),
    [drivers]
  );

  const handleSelectCategory = useCallback(
    (category: FilterCategory) => {
      setCategory(category);
    },
    [setCategory]
  );

  const handleDriverPress = useCallback(
    (driver: Driver) => {
      // Toggle selection if tapped again
      if (selectedDriverId === driver.id) {
        selectDriver(null);
      } else {
        selectDriver(driver.id);
      }
    },
    [selectedDriverId, selectDriver]
  );

  return (
    <BottomSheet
      index={1} // Defaults to 45% snap point
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enablePanDownToClose={false}
    >
      <View style={styles.contentContainer}>
        {/* Header Title */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>JomoRide Chauffeur Radar</Text>
            <Text style={styles.subtitle}>Select tier to filter live drivers on map</Text>
          </View>
        </View>

        {/* Category Selector Pills */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          counts={counts}
        />

        {/* Driver List */}
        <BottomSheetFlatList
          data={filteredDrivers}
          keyExtractor={(item: Driver) => item.id}
          renderItem={({ item }: { item: Driver }) => (
            <DriverListItem
              driver={item}
              isSelected={item.id === selectedDriverId}
              onPress={handleDriverPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No available drivers in this tier nearby.</Text>
            </View>
          }
        />

        {/* Selected Driver Action Bar */}
        {selectedDriver && (
          <View style={styles.actionFooter}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Selected Chauffeur</Text>
              <Text style={styles.actionDriverName}>
                {selectedDriver.name} • {selectedDriver.fareEstimate}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.bookButton,
                {
                  backgroundColor:
                    selectedDriver.type === 'premium'
                      ? COLORS.premiumGold
                      : COLORS.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => {
                console.log('Driver booked:', selectedDriver);
              }}
            >
              <Text style={styles.bookButtonText}>
                {selectedDriver.type === 'premium' ? 'Confirm Chauffeur' : 'Book Ride'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.sheetBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 20,
  },
  handleIndicator: {
    backgroundColor: COLORS.sheetHandle,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionDriverName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bookButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#0B0D13',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
