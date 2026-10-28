import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  LayoutAnimation,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
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
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Clock Icon
const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Left Icon
const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Right Icon
const ChevronRightIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close Icon
const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Wheel Picker Constants
const ITEM_HEIGHT = 36;
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));
const AMPM = ['AM', 'PM'];

// ========================================================
// Liquid Glass Wheel Time Picker Component
// ========================================================
interface WheelPickerProps {
  initialDate: Date;
  onChange: (h24: number, min: number) => void;
}

const WheelTimePicker: React.FC<WheelPickerProps> = ({ initialDate, onChange }) => {
  const currentHour12 = initialDate.getHours() % 12 || 12;
  const currentMin = initialDate.getMinutes();
  const currentAmPm = initialDate.getHours() >= 12 ? 'PM' : 'AM';

  const initialHourIdx = HOURS.indexOf(currentHour12);
  const initialMinIdx = currentMin;
  const initialAmPmIdx = currentAmPm === 'AM' ? 0 : 1;

  const [selectedHourIdx, setSelectedHourIdx] = useState(
    initialHourIdx >= 0 ? initialHourIdx : 0
  );
  const [selectedMinIdx, setSelectedMinIdx] = useState(initialMinIdx);
  const [selectedAmPmIdx, setSelectedAmPmIdx] = useState(initialAmPmIdx);

  const hourScrollRef = useRef<any>(null);
  const minScrollRef = useRef<any>(null);
  const ampmScrollRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: selectedHourIdx * ITEM_HEIGHT,
        animated: false,
      });
      minScrollRef.current?.scrollTo({
        y: selectedMinIdx * ITEM_HEIGHT,
        animated: false,
      });
      ampmScrollRef.current?.scrollTo({
        y: selectedAmPmIdx * ITEM_HEIGHT,
        animated: false,
      });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const emitChange = (hIdx: number, mIdx: number, apIdx: number) => {
    const h12 = HOURS[hIdx];
    const min = parseInt(MINUTES[mIdx], 10);
    const ap = AMPM[apIdx];
    let h24 = h12 % 12;
    if (ap === 'PM') h24 += 12;
    onChange(h24, min);
  };

  const onHourScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(HOURS.length - 1, Math.round(y / ITEM_HEIGHT)));
    setSelectedHourIdx(idx);
    emitChange(idx, selectedMinIdx, selectedAmPmIdx);
  };

  const onMinScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(MINUTES.length - 1, Math.round(y / ITEM_HEIGHT)));
    setSelectedMinIdx(idx);
    emitChange(selectedHourIdx, idx, selectedAmPmIdx);
  };

  const onAmPmScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(AMPM.length - 1, Math.round(y / ITEM_HEIGHT)));
    setSelectedAmPmIdx(idx);
    emitChange(selectedHourIdx, selectedMinIdx, idx);
  };

  const handleTapHour = (idx: number) => {
    hourScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    setSelectedHourIdx(idx);
    emitChange(idx, selectedMinIdx, selectedAmPmIdx);
  };

  const handleTapMin = (idx: number) => {
    minScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    setSelectedMinIdx(idx);
    emitChange(selectedHourIdx, idx, selectedAmPmIdx);
  };

  const handleTapAmPm = (idx: number) => {
    ampmScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    setSelectedAmPmIdx(idx);
    emitChange(selectedHourIdx, selectedMinIdx, idx);
  };

  return (
    <View style={wheelStyles.wheelBox}>
      {/* Liquid Glass Highlight Capsule across all 3 columns */}
      <View style={wheelStyles.highlightCapsule} pointerEvents="none" />

      {/* Column 1: Hours */}
      <ScrollView
        ref={hourScrollRef}
        style={wheelStyles.columnScroll}
        contentContainerStyle={wheelStyles.columnContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={onHourScrollEnd}
      >
        {HOURS.map((h, i) => (
          <TouchableOpacity
            key={`h-${h}`}
            style={wheelStyles.itemCell}
            onPress={() => handleTapHour(i)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                wheelStyles.itemText,
                i === selectedHourIdx && wheelStyles.itemTextActive,
              ]}
            >
              {h}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Column 2: Minutes */}
      <ScrollView
        ref={minScrollRef}
        style={wheelStyles.columnScroll}
        contentContainerStyle={wheelStyles.columnContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={onMinScrollEnd}
      >
        {MINUTES.map((m, i) => (
          <TouchableOpacity
            key={`m-${m}`}
            style={wheelStyles.itemCell}
            onPress={() => handleTapMin(i)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                wheelStyles.itemText,
                i === selectedMinIdx && wheelStyles.itemTextActive,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Column 3: AM / PM */}
      <ScrollView
        ref={ampmScrollRef}
        style={wheelStyles.columnScroll}
        contentContainerStyle={wheelStyles.columnContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={onAmPmScrollEnd}
      >
        {AMPM.map((ap, i) => (
          <TouchableOpacity
            key={`ap-${ap}`}
            style={wheelStyles.itemCell}
            onPress={() => handleTapAmPm(i)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                wheelStyles.itemText,
                i === selectedAmPmIdx && wheelStyles.itemTextActive,
              ]}
            >
              {ap}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ========================================================
// Main Driver Bottom Sheet Component
// ========================================================
export const DriverBottomSheet: React.FC = () => {
  // Snap points for the drawer
  const snapPoints = useMemo(() => ['22%', '60%', '92%'], []);

  // Store bindings
  const selectedCategory = useDriverStore(state => state.selectedCategory);
  const selectedDuration = useDriverStore(state => state.selectedDuration);
  const bookingMode = useDriverStore(state => state.bookingMode);
  const scheduledTimestamp = useDriverStore(state => state.scheduledTimestamp);
  const bookingStatus = useDriverStore(state => state.bookingStatus);
  const matchedDriver = useDriverStore(state => state.matchedDriver);

  const togglePremium = useDriverStore(state => state.togglePremium);
  const setDuration = useDriverStore(state => state.setDuration);
  const incrementDuration = useDriverStore(state => state.incrementDuration);
  const decrementDuration = useDriverStore(state => state.decrementDuration);
  const setBookingMode = useDriverStore(state => state.setBookingMode);
  const setScheduledTimestamp = useDriverStore(state => state.setScheduledTimestamp);
  const startBooking = useDriverStore(state => state.startBooking);
  const cancelBooking = useDriverStore(state => state.cancelBooking);
  const getHourlyRate = useDriverStore(state => state.getHourlyRate);
  const getTotalFare = useDriverStore(state => state.getTotalFare);

  // Local state for hours input string so user can freely type
  const [hoursText, setHoursText] = useState(String(selectedDuration));

  useEffect(() => {
    setHoursText(String(selectedDuration));
  }, [selectedDuration]);

  // Liquid Glass Modal Overlay State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<'date' | 'time'>('date');

  // Smooth tab switch without layout thrashing
  const switchTab = (tab: 'date' | 'time') => {
    if (tab === modalTab) return;
    setModalTab(tab);
  };

  // Parse start date from store
  const startDate = useMemo(() => new Date(scheduledTimestamp), [scheduledTimestamp]);

  // Calendar navigation state inside modal
  const [navYear, setNavYear] = useState(startDate.getFullYear());
  const [navMonth, setNavMonth] = useState(startDate.getMonth());

  useEffect(() => {
    setNavYear(startDate.getFullYear());
    setNavMonth(startDate.getMonth());
  }, [startDate]);

  // Formatter helpers
  const formatCompactDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatCompactTime = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mStr} ${ampm}`;
  };

  const startDateFormatted = formatCompactDate(startDate);
  const startTimeFormatted = formatCompactTime(startDate);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(navYear, navMonth + 1, 0).getDate();
  }, [navYear, navMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(navYear, navMonth, 1).getDay();
  }, [navYear, navMonth]);

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(y => y - 1);
    } else {
      setNavMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(y => y + 1);
    } else {
      setNavMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const updated = new Date(startDate);
    updated.setFullYear(navYear);
    updated.setMonth(navMonth);
    updated.setDate(day);
    setScheduledTimestamp(updated.getTime());
  };

  const handleWheelTimeChange = (h24: number, min: number) => {
    const updated = new Date(startDate);
    updated.setHours(h24, min, 0, 0);
    setScheduledTimestamp(updated.getTime());
  };

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

  const handleHoursInputChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setHoursText(numeric);
    if (numeric.length > 0) {
      const parsed = parseInt(numeric, 10);
      if (parsed >= 1) {
        setDuration(parsed);
      }
    }
  };

  const handleHoursBlur = () => {
    if (!hoursText || parseInt(hoursText, 10) < 1) {
      setDuration(1);
      setHoursText('1');
    } else {
      setHoursText(String(selectedDuration));
    }
  };

  return (
    <>
      <BottomSheet
        index={1} // Default height
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
              {/* Header with Minimal Premium Toggle */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Hire a Chauffeur</Text>
                  <Text style={styles.subtitle}>Verified personal drivers on demand</Text>
                </View>

                {/* Minimal Clean Toggle: Just 'Premium' + Switch */}
                <View style={styles.minimalToggleContainer}>
                  <Text style={styles.premiumText}>Premium</Text>
                  <Switch
                    value={isPremium}
                    onValueChange={togglePremium}
                    trackColor={{ false: '#262D3D', true: COLORS.premiumGold }}
                    thumbColor={isPremium ? '#000000' : '#FFFFFF'}
                    ios_backgroundColor="#262D3D"
                  />
                </View>
              </View>

              {/* Timing Selector (Now vs Schedule) */}
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>WHEN TO HIRE</Text>
                <View style={styles.timingPills}>
                  <TouchableOpacity
                    style={[
                      styles.timingPill,
                      bookingMode === 'now' && styles.timingPillActive,
                    ]}
                    onPress={() => setBookingMode('now')}
                    activeOpacity={0.8}
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.scheduleRow}>
                      <CalendarIcon
                        color={bookingMode === 'schedule' ? '#0A84FF' : COLORS.textSecondary}
                      />
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

              {/* Clean Single Starts Row (Tapping opens the Liquid Glass Modal Overlay) */}
              {bookingMode === 'schedule' && (
                <Animated.View
                  entering={FadeInDown.duration(240)}
                  exiting={FadeOutUp.duration(180)}
                  style={styles.sectionRow}
                >
                  <Text style={styles.sectionLabel}>DATE & TIME</Text>

                  <View style={styles.dateTimeCard}>
                    <View style={styles.dateTimeRow}>
                      <Text style={styles.rowLabel}>Starts</Text>
                      <View style={styles.pillsCluster}>
                        {/* Date Pill: Opens Modal to Date tab */}
                        <TouchableOpacity
                          style={styles.compactPill}
                          onPress={() => {
                            setModalTab('date');
                            setIsModalVisible(true);
                          }}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.compactPillText}>{startDateFormatted}</Text>
                        </TouchableOpacity>

                        {/* Time Pill: Opens Modal to Time tab */}
                        <TouchableOpacity
                          style={styles.compactPill}
                          onPress={() => {
                            setModalTab('time');
                            setIsModalVisible(true);
                          }}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.compactPillText}>{startTimeFormatted}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Duty Duration: Clean Single Row with Left Label and Right iOS UIStepper Counter */}
              <View style={styles.durationCard}>
                <View style={styles.durationLeft}>
                  <Text style={styles.rowLabel}>Duration</Text>
                  <Text style={styles.durationSubtext}>
                    {selectedDuration} {selectedDuration === 1 ? 'hour' : 'hours'} coverage
                  </Text>
                </View>

                <View style={styles.durationRight}>
                  {/* Number Input / Display (Tap to type) */}
                  <TextInput
                    style={styles.durationInput}
                    value={hoursText}
                    onChangeText={handleHoursInputChange}
                    onBlur={handleHoursBlur}
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                  />

                  {/* Native iOS UIStepper Capsule [ — | + ] */}
                  <View style={styles.iosStepperCapsule}>
                    <TouchableOpacity
                      style={styles.stepperHalf}
                      onPress={decrementDuration}
                      disabled={selectedDuration <= 1}
                      activeOpacity={0.65}
                    >
                      <Text
                        style={[
                          styles.stepperSymbol,
                          selectedDuration <= 1 && styles.stepperSymbolDisabled,
                        ]}
                      >
                        −
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.stepperDivider} />

                    <TouchableOpacity
                      style={styles.stepperHalf}
                      onPress={incrementDuration}
                      disabled={selectedDuration >= 168}
                      activeOpacity={0.65}
                    >
                      <Text
                        style={[
                          styles.stepperSymbol,
                          selectedDuration >= 168 && styles.stepperSymbolDisabled,
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                      ${hourlyRate}/hr × {selectedDuration} {selectedDuration === 1 ? 'hour' : 'hours'}
                      {bookingMode === 'schedule'
                        ? ` • Starts ${startDateFormatted} @ ${startTimeFormatted}`
                        : ' • Instant Dispatch'}
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
                <Text
                  style={[
                    styles.bookButtonText,
                    { color: isPremium ? '#0B0D13' : '#FFFFFF' },
                  ]}
                >
                  {bookingMode === 'schedule'
                    ? `Schedule Chauffeur • $${totalFare}`
                    : `${isPremium ? 'Hire Premium Chauffeur' : 'Hire Standard Driver'} • $${totalFare}`}
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

              <Text style={styles.searchingTitle}>
                {bookingMode === 'schedule'
                  ? 'Reserving Personal Chauffeur...'
                  : 'Dispatching Nearest Chauffeur...'}
              </Text>
              <Text style={styles.searchingSubtitle}>
                {bookingMode === 'schedule'
                  ? `Assigning top-rated chauffeur for ${startDateFormatted} @ ${startTimeFormatted}`
                  : `Connecting telemetry with ${isPremium ? '★ Premium VIP' : 'Standard'} drivers within 1.5 km`}
              </Text>

              <View style={styles.searchingStatusPill}>
                <View style={styles.liveSearchingDot} />
                <Text style={styles.searchingStatusText}>
                  {bookingMode === 'schedule' ? 'RESERVING CHAUFFEUR' : 'LIVE RADAR ACTIVE'}
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* STATE 3: CONFIRMED - Driver Assigned & On The Way       */}
          {/* ======================================================== */}
          {bookingStatus === 'confirmed' && matchedDriver && (
            <View style={styles.confirmedContainer}>
              {bookingMode === 'now' ? (
                /* Instant Booking: Chauffeur is en route immediately */
                <View style={styles.confirmedHeader}>
                  <View style={styles.successBadge}>
                    <CheckCircleIcon color="#10B981" />
                    <Text style={styles.successBadgeText}>CHAUFFEUR ON THE WAY</Text>
                  </View>
                  <Text style={styles.etaHeading}>Arriving at your car in 3 mins</Text>
                  <Text style={styles.etaSubheading}>
                    Chauffeur is approaching on 2-wheeler to collect keys
                  </Text>
                </View>
              ) : (
                /* Scheduled Booking: Reserved for future date & time (no 3 min ETA, no map line) */
                <View style={styles.confirmedHeader}>
                  <View style={styles.scheduleBadge}>
                    <CalendarIcon color="#0A84FF" />
                    <Text style={styles.scheduleBadgeText}>CHAUFFEUR RESERVED</Text>
                  </View>
                  <Text style={styles.etaHeading}>
                    {startDateFormatted} @ {startTimeFormatted}
                  </Text>
                  <Text style={styles.etaSubheading}>
                    {selectedDuration}h duty reserved • Key handover at your vehicle
                  </Text>
                </View>
              )}

              {/* Scheduled Booking Dispatch Notice */}
              {bookingMode === 'schedule' && (
                <View style={styles.dispatchNoticeCard}>
                  <View style={styles.dispatchNoticeRow}>
                    <Text style={styles.dispatchNoticeIcon}>🛵</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dispatchNoticeTitle}>Key Handover at Pickup</Text>
                      <Text style={styles.dispatchNoticeBody}>
                        Chauffeur will arrive 30 mins before scheduled duty to collect keys with OTP. Live radar tracking activates on departure.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

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
                <View style={styles.otpLeft}>
                  <Text style={styles.otpLabel}>KEY HANDOVER OTP</Text>
                  <Text style={styles.otpSublabel}>
                    {bookingMode === 'schedule'
                      ? 'Share with chauffeur when they arrive for scheduled handover'
                      : 'Share with driver before handing over car keys'}
                  </Text>
                </View>
                <View style={styles.otpBadge}>
                  <Text style={styles.otpCode}>4821</Text>
                </View>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={cancelBooking}
              >
                <Text style={styles.cancelButtonText}>
                  {bookingMode === 'schedule' ? 'Cancel Scheduled Reservation' : 'Cancel Chauffeur Request'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* ======================================================== */}
      {/* LIQUID GLASS DATE & TIME PICKER MODAL OVERLAY           */}
      {/* ======================================================== */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={glassStyles.overlayBackdrop}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={glassStyles.liquidGlassCard}>
                {/* Specular Edge Top Highlight */}
                <View style={glassStyles.specularHighlight} />

                {/* Modal Header */}
                <View style={glassStyles.headerRow}>
                  <View>
                    <Text style={glassStyles.headerTitle}>Schedule Pickup</Text>
                    <Text style={glassStyles.headerSubtitle}>
                      Personal chauffeur handover time
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={glassStyles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <CloseIcon color="#8E9AA8" />
                  </TouchableOpacity>
                </View>

                {/* Liquid Glass Segmented Tab Switcher */}
                <View style={glassStyles.segmentedContainer}>
                  <TouchableOpacity
                    style={[
                      glassStyles.segmentTab,
                      modalTab === 'date' && glassStyles.segmentTabActive,
                    ]}
                    onPress={() => switchTab('date')}
                    activeOpacity={0.8}
                  >
                    <CalendarIcon color={modalTab === 'date' ? '#FFFFFF' : '#8E9AA8'} />
                    <Text
                      style={[
                        glassStyles.segmentText,
                        modalTab === 'date' && glassStyles.segmentTextActive,
                      ]}
                    >
                      {startDateFormatted}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      glassStyles.segmentTab,
                      modalTab === 'time' && glassStyles.segmentTabActive,
                    ]}
                    onPress={() => switchTab('time')}
                    activeOpacity={0.8}
                  >
                    <ClockIcon color={modalTab === 'time' ? '#FFFFFF' : '#8E9AA8'} />
                    <Text
                      style={[
                        glassStyles.segmentText,
                        modalTab === 'time' && glassStyles.segmentTextActive,
                      ]}
                    >
                      {startTimeFormatted}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Content Area: Fixed Height Rock-Solid Viewport with Soft Element Fade */}
                <View style={glassStyles.contentContainer}>
                  {modalTab === 'date' ? (
                    <Animated.View
                      key="calendar-view"
                      entering={FadeIn.duration(180)}
                      exiting={FadeOut.duration(100)}
                      style={glassStyles.calendarBox}
                    >
                      {/* Month Navigation */}
                      <View style={glassStyles.calendarNavRow}>
                        <TouchableOpacity
                          style={glassStyles.navArrowBtn}
                          onPress={handlePrevMonth}
                          activeOpacity={0.7}
                        >
                          <ChevronLeftIcon color="#0A84FF" />
                        </TouchableOpacity>

                        <Text style={glassStyles.monthHeading}>
                          {MONTH_NAMES[navMonth]} {navYear}
                        </Text>

                        <TouchableOpacity
                          style={glassStyles.navArrowBtn}
                          onPress={handleNextMonth}
                          activeOpacity={0.7}
                        >
                          <ChevronRightIcon color="#0A84FF" />
                        </TouchableOpacity>
                      </View>

                      {/* Day of week labels (Strict 7 Columns matching days) */}
                      <View style={glassStyles.weekdaysRow}>
                        {WEEK_DAYS.map((wd, idx) => (
                          <Text key={idx} style={glassStyles.weekdayText}>
                            {wd}
                          </Text>
                        ))}
                      </View>

                      {/* Days Grid (Strict 7 Columns, Days strictly under weekdays) */}
                      <View style={glassStyles.daysGrid}>
                        {calendarCells.map((day, idx) => {
                          if (day === null) {
                            return <View key={`empty-${idx}`} style={glassStyles.dayCellSlot} />;
                          }
                          const isSelected =
                            day === startDate.getDate() &&
                            navMonth === startDate.getMonth() &&
                            navYear === startDate.getFullYear();

                          return (
                            <View key={`day-${day}`} style={glassStyles.dayCellSlot}>
                              <TouchableOpacity
                                style={[
                                  glassStyles.dayButton,
                                  isSelected && glassStyles.dayButtonSelected,
                                ]}
                                onPress={() => handleSelectDay(day)}
                                activeOpacity={0.7}
                              >
                                <Text
                                  style={[
                                    glassStyles.dayText,
                                    isSelected && glassStyles.dayTextSelected,
                                  ]}
                                >
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    </Animated.View>
                  ) : (
                    <Animated.View
                      key="time-view"
                      entering={FadeIn.duration(180)}
                      exiting={FadeOut.duration(100)}
                      style={glassStyles.wheelContainer}
                    >
                      <WheelTimePicker
                        initialDate={startDate}
                        onChange={handleWheelTimeChange}
                      />
                    </Animated.View>
                  )}
                </View>

                {/* Confirm CTA Button */}
                <TouchableOpacity
                  style={glassStyles.confirmButton}
                  onPress={() => setIsModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={glassStyles.confirmButtonText}>
                    Set Pickup • {startDateFormatted} @ {startTimeFormatted}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

// ========================================================
// Styles
// ========================================================
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
  minimalToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  timingPillActive: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
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
    color: '#0A84FF',
    fontWeight: '700',
  },
  dateTimeCard: {
    backgroundColor: '#161922',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  pillsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactPill: {
    backgroundColor: '#262D3D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compactPillText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  durationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161922',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  durationLeft: {
    flex: 1,
  },
  durationSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  durationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
    marginRight: 10,
    minWidth: 32,
    paddingVertical: 2,
  },
  iosStepperCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262D3D',
    borderRadius: 8,
    height: 32,
    width: 94,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperHalf: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A84FF',
    lineHeight: 20,
  },
  stepperSymbolDisabled: {
    color: '#4B5565',
  },
  stepperDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    borderColor: 'rgba(10, 132, 255, 0.4)',
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
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  countdownNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A84FF',
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
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  liveSearchingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A84FF',
    marginRight: 6,
  },
  searchingStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A84FF',
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
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scheduleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A84FF',
    letterSpacing: 0.8,
  },
  etaHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  etaSubheading: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  dispatchNoticeCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.22)',
    padding: 14,
    marginBottom: 14,
  },
  dispatchNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dispatchNoticeIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  dispatchNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A84FF',
    marginBottom: 2,
  },
  dispatchNoticeBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  otpLeft: {
    flex: 1,
    paddingRight: 14,
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
    lineHeight: 16,
  },
  otpBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  otpCode: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A84FF',
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

// ========================================================
// Liquid Glass Modal Overlay Styles
// ========================================================
const glassStyles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 14, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  liquidGlassCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(20, 25, 38, 0.94)',
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 25,
    overflow: 'hidden',
  },
  specularHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E9AA8',
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#0A84FF',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E9AA8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentContainer: {
    height: 280,
    justifyContent: 'center',
  },
  calendarBox: {
    width: '100%',
  },
  calendarNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 6,
  },
  weekdayText: {
    width: '14.285%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#8E9AA8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayCellSlot: {
    width: '14.285%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#0A84FF',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

// Styles for the liquid glass wheel picker
const wheelStyles = StyleSheet.create({
  wheelBox: {
    flexDirection: 'row',
    height: 180, // 5 * 36
    width: 250,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  highlightCapsule: {
    position: 'absolute',
    top: 72, // 2 * 36
    left: 8,
    right: 8,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  columnScroll: {
    flex: 1,
    height: '100%',
  },
  columnContent: {
    paddingVertical: 72, // 2 * 36
  },
  itemCell: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  itemTextActive: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
