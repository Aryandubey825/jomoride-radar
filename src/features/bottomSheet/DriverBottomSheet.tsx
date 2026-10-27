import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Svg, { Path, Circle } from 'react-native-svg';
import { useDriverStore } from '../../store/useDriverStore';
import { COLORS } from '../../theme/colors';
import { FilterCategory } from '../../types/driver';

// Verified badge icon
const CheckCircleIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DriverBottomSheet: React.FC = () => {
  // Snap points for the drawer
  const snapPoints = useMemo(() => ['22%', '52%', '88%'], []);

  // Store bindings
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const selectedDuration = useDriverStore(state => state.selectedDuration);
  const bookingMode = useDriverStore(state => state.bookingMode);
  const bookingStatus = useDriverStore(state => state.bookingStatus);
  const matchedDriver = useDriverStore(state => state.matchedDriver);

  const setCategory = useDriverStore(state => state.setCategory);
  const setDuration = useDriverStore(state => state.setDuration);
  const setBookingMode = useDriverStore(state => state.setBookingMode);
  const startBooking = useDriverStore(state => state.startBooking);
  const cancelBooking = useDriverStore(state => state.cancelBooking);
  const getHourlyRate = useDriverStore(state => state.getHourlyRate);
  const getTotalFare = useDriverStore(state => state.getTotalFare);

  // Countdown timer for searching animation
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (bookingStatus === 'searching') {
      setCountdown(4);
      timer = setInterval(() => {
        setCountdown(prev => (prev > 1 ? prev - 1 : 1));
      }, 900);
    }
    return () => clearInterval(timer);
  }, [bookingStatus]);

  const durations = [
    { hours: 2, label: '2 Hrs' },
    { hours: 4, label: '4 Hrs' },
    { hours: 8, label: '8 Hrs (Day)' },
    { hours: 24, label: '24 Hrs' },
  ];

  const hourlyRate = getHourlyRate();
  const totalFare = getTotalFare();
  const isPremium = selectedCategory === 'premium';

  return (
    <BottomSheet
      index={1} // 52% default height
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enablePanDownToClose={false}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* STATE 1: IDLE - Booking & Rental Configuration          */}
        {/* ======================================================== */}
        {bookingStatus === 'idle' && (
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Hire a Chauffeur for Your Car</Text>
              <Text style={styles.subtitle}>Select tier & booking duration</Text>
            </View>

            {/* Step 1: Tier Selector (Standard vs Premium) */}
            <View style={styles.tierSelector}>
              {(['all', 'standard', 'premium'] as FilterCategory[]).map(cat => {
                const isActive = selectedCategory === cat;
                const label =
                  cat === 'all'
                    ? 'All Fleet'
                    : cat === 'standard'
                    ? 'Standard • $22/h'
                    : '★ Premium • $48/h';
                const accent =
                  cat === 'premium'
                    ? COLORS.premiumGold
                    : cat === 'standard'
                    ? COLORS.primary
                    : COLORS.textPrimary;

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.tierPill,
                      isActive && styles.tierPillActive,
                      isActive && { borderColor: accent },
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.tierLabel,
                        { color: isActive ? accent : COLORS.textSecondary },
                        isActive && styles.tierLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Step 2: When (Now vs Schedule) */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>TIMING</Text>
              <View style={styles.timingPills}>
                <TouchableOpacity
                  style={[
                    styles.timingPill,
                    bookingMode === 'now' && styles.timingPillActive,
                  ]}
                  onPress={() => setBookingMode('now')}
                >
                  <Text
                    style={[
                      styles.timingLabel,
                      bookingMode === 'now' && styles.timingLabelActive,
                    ]}
                  >
                    Right Now (Instant)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.timingPill,
                    bookingMode === 'schedule' && styles.timingPillActive,
                  ]}
                  onPress={() => setBookingMode('schedule')}
                >
                  <Text
                    style={[
                      styles.timingLabel,
                      bookingMode === 'schedule' && styles.timingLabelActive,
                    ]}
                  >
                    Schedule Today
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 3: Duration Selection (Hours) */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>HIRE DURATION</Text>
              <View style={styles.durationPills}>
                {durations.map(d => {
                  const isSelected = selectedDuration === d.hours;
                  return (
                    <TouchableOpacity
                      key={d.hours}
                      style={[
                        styles.durationPill,
                        isSelected && styles.durationPillActive,
                      ]}
                      onPress={() => setDuration(d.hours)}
                    >
                      <Text
                        style={[
                          styles.durationLabel,
                          isSelected && styles.durationLabelActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Fare Summary Breakdown Card */}
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <View>
                  <Text style={styles.fareTierTitle}>
                    {isPremium ? '★ Premium Executive Chauffeur' : 'Standard Verified Driver'}
                  </Text>
                  <Text style={styles.fareCalculation}>
                    ${hourlyRate}/hr × {selectedDuration} hours duration
                  </Text>
                </View>
                <Text style={styles.totalFareText}>${totalFare}</Text>
              </View>

              <View style={styles.perkRow}>
                <CheckCircleIcon color={COLORS.onlineGreen} />
                <Text style={styles.perkText}>
                  Includes car handover insurance & background check
                </Text>
              </View>
            </View>

            {/* Main Action Button */}
            <TouchableOpacity
              style={[
                styles.bookButton,
                {
                  backgroundColor: isPremium ? COLORS.premiumGold : COLORS.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={startBooking}
            >
              <Text style={styles.bookButtonText}>
                {isPremium ? 'Hire Premium Chauffeur' : 'Hire Standard Driver'} • ${totalFare}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* STATE 2: SEARCHING - Rapido / Uber Style Radar Timer    */}
        {/* ======================================================== */}
        {bookingStatus === 'searching' && (
          <View style={styles.searchingContainer}>
            <View style={styles.searchingAnimationRing}>
              <View style={styles.pulsingCore} />
              <Text style={styles.countdownNumber}>{countdown}s</Text>
            </View>

            <Text style={styles.searchingTitle}>Searching Nearby Chauffeurs...</Text>
            <Text style={styles.searchingSubtitle}>
              Matching with nearest verified {isPremium ? 'Premium' : 'Standard'} drivers within 1.5 km
            </Text>

            <View style={styles.searchingStatusPill}>
              <View style={styles.liveSearchingDot} />
              <Text style={styles.searchingStatusText}>CONNECTING TELEMETRY RADAR</Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STATE 3: CONFIRMED - Driver Assigned & On The Way      */}
        {/* ======================================================== */}
        {bookingStatus === 'confirmed' && matchedDriver && (
          <View style={styles.confirmedContainer}>
            <View style={styles.confirmedHeader}>
              <View style={styles.successBadge}>
                <CheckCircleIcon color="#10B981" />
                <Text style={styles.successBadgeText}>CHAUFFEUR ASSIGNED</Text>
              </View>
              <Text style={styles.etaHeading}>Arriving at your car in 3 mins</Text>
            </View>

            {/* Driver Profile Card */}
            <View style={styles.driverProfileCard}>
              <Image source={{ uri: matchedDriver.avatar }} style={styles.driverAvatar} />

              <View style={styles.driverDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.driverName}>{matchedDriver.name}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: isPremium ? '#2A2207' : '#192030' }]}>
                    <Text style={[styles.tierBadgeText, { color: isPremium ? COLORS.premiumGold : COLORS.primary }]}>
                      {isPremium ? 'VIP CHAUFFEUR' : 'VERIFIED'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ratingText}>
                  ★ {matchedDriver.rating.toFixed(2)} • 1,420+ safe trips
                </Text>
                <Text style={styles.vehicleSpecialty}>
                  Vehicle assigned: <Text style={styles.vehicleHighlight}>Your Personal Car</Text>
                </Text>
              </View>
            </View>

            {/* Key Handover Security OTP */}
            <View style={styles.otpCard}>
              <View>
                <Text style={styles.otpLabel}>KEY HANDOVER OTP</Text>
                <Text style={styles.otpSublabel}>Share with driver before handing keys</Text>
              </View>
              <Text style={styles.otpCode}>4821</Text>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={cancelBooking}
            >
              <Text style={styles.cancelButtonText}>Cancel Chauffeur Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetScrollView>
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
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 20,
  },
  handleIndicator: {
    backgroundColor: COLORS.sheetHandle,
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  header: {
    marginBottom: 14,
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
  tierSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tierPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  tierPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tierLabelActive: {
    fontWeight: '800',
  },
  sectionRow: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timingPills: {
    flexDirection: 'row',
    gap: 10,
  },
  timingPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  timingPillActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  timingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timingLabelActive: {
    color: '#00E5FF',
    fontWeight: '700',
  },
  durationPills: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  durationPillActive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  durationLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  fareCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fareTierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fareCalculation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  totalFareText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  perkText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bookButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bookButtonText: {
    color: '#0B0D13',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  searchingAnimationRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  pulsingCore: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  countdownNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00E5FF',
  },
  searchingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  searchingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  searchingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  liveSearchingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
    marginRight: 6,
  },
  searchingStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 0.6,
  },
  confirmedContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  confirmedHeader: {
    marginBottom: 14,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  etaHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  driverProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  driverDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.starYellow,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleSpecialty: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  vehicleHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  otpCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  otpSublabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  otpCode: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
});
