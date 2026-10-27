import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';
import { useDriverStore } from '../../store/useDriverStore';
import { COLORS } from '../../theme/colors';

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

// Calendar Icon
const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DriverBottomSheet: React.FC = () => {
  // Snap points for the drawer
  const snapPoints = useMemo(() => ['22%', '58%', '90%'], []);

  // Store bindings
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const selectedDuration = useDriverStore(state => state.selectedDuration);
  const bookingMode = useDriverStore(state => state.bookingMode);
  const scheduledDate = useDriverStore(state => state.scheduledDate);
  const scheduledTime = useDriverStore(state => state.scheduledTime);
  const bookingStatus = useDriverStore(state => state.bookingStatus);
  const matchedDriver = useDriverStore(state => state.matchedDriver);

  const togglePremium = useDriverStore(state => state.togglePremium);
  const setDuration = useDriverStore(state => state.setDuration);
  const setBookingMode = useDriverStore(state => state.setBookingMode);
  const setScheduledDate = useDriverStore(state => state.setScheduledDate);
  const setScheduledTime = useDriverStore(state => state.setScheduledTime);
  const startBooking = useDriverStore(state => state.startBooking);
  const cancelBooking = useDriverStore(state => state.cancelBooking);
  const getHourlyRate = useDriverStore(state => state.getHourlyRate);
  const getTotalFare = useDriverStore(state => state.getTotalFare);

  // Countdown timer for Rapido-style search
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

  const isPremium = selectedCategory === 'premium';
  const hourlyRate = getHourlyRate();
  const totalFare = getTotalFare();

  const durations = [
    { hours: 2, label: '2 Hrs' },
    { hours: 4, label: '4 Hrs' },
    { hours: 8, label: '8 Hrs (Day)' },
    { hours: 24, label: '24 Hrs' },
  ];

  const dates = ['Today, 28 Oct', 'Tomorrow, 29 Oct', 'Fri, 30 Oct'];
  const times = ['09:00 AM', '02:00 PM', '07:00 PM', '10:00 PM'];

  return (
    <BottomSheet
      index={1} // 58% default height
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
        {/* STATE 1: IDLE - Chauffeur Rental Configuration          */}
        {/* ======================================================== */}
        {bookingStatus === 'idle' && (
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Hire a Chauffeur for Your Car</Text>
              <Text style={styles.subtitle}>Verified on-demand personal drivers</Text>
            </View>

            {/* Step 1: Clean Premium Toggle Card (Replaces 3 Buttons) */}
            <TouchableOpacity
              style={[
                styles.toggleCard,
                isPremium && styles.toggleCardActive,
                { borderColor: isPremium ? COLORS.premiumGold : COLORS.surfaceBorder },
              ]}
              onPress={togglePremium}
              activeOpacity={0.85}
            >
              <View style={styles.toggleInfo}>
                <View style={styles.tierTitleRow}>
                  <Text style={[styles.tierTitle, isPremium && { color: COLORS.premiumGold }]}>
                    {isPremium ? '★ VIP Premium Chauffeur' : 'Standard Verified Driver'}
                  </Text>
                  <View
                    style={[
                      styles.rateTag,
                      { backgroundColor: isPremium ? '#2A2207' : '#102231' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rateTagText,
                        { color: isPremium ? COLORS.premiumGold : COLORS.primary },
                      ]}
                    >
                      ${hourlyRate}/hr
                    </Text>
                  </View>
                </View>
                <Text style={styles.tierDescription}>
                  {isPremium
                    ? 'Certified suited chauffeur for luxury cars & EVs'
                    : 'Experienced driver for daily commute & sedans'}
                </Text>
              </View>

              {/* iOS Style Switch */}
              <Switch
                value={isPremium}
                onValueChange={togglePremium}
                trackColor={{ false: '#262D3D', true: COLORS.premiumGold }}
                thumbColor={isPremium ? '#000000' : '#FFFFFF'}
                ios_backgroundColor="#262D3D"
              />
            </TouchableOpacity>

            {/* Step 2: Timing Selector (Now vs Schedule) */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>WHEN TO HIRE</Text>
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
                  <View style={styles.scheduleRow}>
                    <CalendarIcon color={bookingMode === 'schedule' ? '#00E5FF' : COLORS.textSecondary} />
                    <Text
                      style={[
                        styles.timingLabel,
                        { marginLeft: 6 },
                        bookingMode === 'schedule' && styles.timingLabelActive,
                      ]}
                    >
                      Schedule Later
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Smooth Expandable Date & Time Picker (Only when Schedule is selected!) */}
            {bookingMode === 'schedule' && (
              <View style={styles.scheduleAccordion}>
                {/* Select Date */}
                <Text style={styles.subSectionLabel}>SELECT DATE</Text>
                <View style={styles.chipRow}>
                  {dates.map(date => {
                    const isSelected = scheduledDate === date;
                    return (
                      <TouchableOpacity
                        key={date}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setScheduledDate(date)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {date}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Select Time Slot */}
                <Text style={[styles.subSectionLabel, { marginTop: 10 }]}>PICKUP TIME</Text>
                <View style={styles.chipRow}>
                  {times.map(time => {
                    const isSelected = scheduledTime === time;
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setScheduledTime(time)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Step 3: Duration Selection (Hours) */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>DUTY DURATION</Text>
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

            {/* Fare Breakdown Card */}
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <View>
                  <Text style={styles.fareTierTitle}>
                    {isPremium ? '★ VIP Premium Chauffeur' : 'Standard Verified Driver'}
                  </Text>
                  <Text style={styles.fareCalculation}>
                    ${hourlyRate}/hr × {selectedDuration} hours
                    {bookingMode === 'schedule' ? ` • ${scheduledDate} @ ${scheduledTime}` : ''}
                  </Text>
                </View>
                <Text style={[styles.totalFareText, isPremium && { color: COLORS.premiumGold }]}>
                  ${totalFare}
                </Text>
              </View>

              <View style={styles.perkRow}>
                <CheckCircleIcon color={COLORS.onlineGreen} />
                <Text style={styles.perkText}>
                  Includes car handover insurance & driver background verification
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
        {/* STATE 2: SEARCHING - Rapido Style Live Radar Timer      */}
        {/* ======================================================== */}
        {bookingStatus === 'searching' && (
          <View style={styles.searchingContainer}>
            <View style={styles.searchingAnimationRing}>
              <View style={styles.pulsingCore} />
              <Text style={styles.countdownNumber}>{countdown}s</Text>
            </View>

            <Text style={styles.searchingTitle}>Dispatching Nearest Chauffeur...</Text>
            <Text style={styles.searchingSubtitle}>
              Connecting telemetry with {isPremium ? '★ Premium VIP' : 'Standard'} drivers within 1.5 km
            </Text>

            <View style={styles.searchingStatusPill}>
              <View style={styles.liveSearchingDot} />
              <Text style={styles.searchingStatusText}>LIVE RADAR ACTIVE</Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STATE 3: CONFIRMED - Driver Assigned & On The Way       */}
        {/* ======================================================== */}
        {bookingStatus === 'confirmed' && matchedDriver && (
          <View style={styles.confirmedContainer}>
            <View style={styles.confirmedHeader}>
              <View style={styles.successBadge}>
                <CheckCircleIcon color="#10B981" />
                <Text style={styles.successBadgeText}>CHAUFFEUR ON THE WAY</Text>
              </View>
              <Text style={styles.etaHeading}>Arriving at your car in 3 mins</Text>
            </View>

            {/* Driver Profile Card */}
            <View style={styles.driverProfileCard}>
              <Image source={{ uri: matchedDriver.avatar }} style={styles.driverAvatar} />

              <View style={styles.driverDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.driverName}>{matchedDriver.name}</Text>
                  <View
                    style={[
                      styles.tierBadge,
                      { backgroundColor: isPremium ? '#2A2207' : '#192030' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        { color: isPremium ? COLORS.premiumGold : COLORS.primary },
                      ]}
                    >
                      {isPremium ? 'VIP CHAUFFEUR' : 'VERIFIED'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ratingText}>
                  ★ {matchedDriver.rating.toFixed(2)} • 1,420+ safe trips
                </Text>
                <Text style={styles.vehicleSpecialty}>
                  Mode: <Text style={styles.vehicleHighlight}>Arriving via 2-Wheeler to take keys</Text>
                </Text>
              </View>
            </View>

            {/* Key Handover Security OTP */}
            <View style={styles.otpCard}>
              <View>
                <Text style={styles.otpLabel}>KEY HANDOVER OTP</Text>
                <Text style={styles.otpSublabel}>Share with driver before handing over car keys</Text>
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
    marginBottom: 12,
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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  toggleCardActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  rateTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rateTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  sectionRow: {
    marginBottom: 14,
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
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scheduleAccordion: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  subSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  chipActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  chipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#00E5FF',
    fontWeight: '800',
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
