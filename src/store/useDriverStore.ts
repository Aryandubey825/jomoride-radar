import { create } from 'zustand';
import { Driver, FilterCategory } from '../types/driver';
import { MOCK_DRIVERS } from '../api/mockDrivers';

export type BookingStatus = 'idle' | 'searching' | 'confirmed';

interface DriverStoreState {
  drivers: Driver[];
  selectedCategory: FilterCategory;
  selectedDriverId: string | null;

  // DaaS Booking State
  bookingStatus: BookingStatus;
  selectedDuration: number; // in hours: 1 to 168 (multi-day chauffeur coverage)
  bookingMode: 'now' | 'schedule';
  scheduledTimestamp: number; // epoch timestamp in ms for precise starts & ends calculation
  scheduledDate: string;
  scheduledTime: string;
  matchedDriver: Driver | null;
  isDriverDeparted: boolean; // whether scheduled chauffeur has marked departure to collect car keys

  // Actions
  setCategory: (category: FilterCategory) => void;
  togglePremium: () => void;
  selectDriver: (driverId: string | null) => void;
  setDuration: (hours: number) => void;
  incrementDuration: () => void;
  decrementDuration: () => void;
  setBookingMode: (mode: 'now' | 'schedule') => void;
  setScheduledTimestamp: (timestamp: number) => void;
  setScheduledDate: (date: string) => void;
  setScheduledTime: (time: string) => void;
  startBooking: () => void;
  cancelBooking: () => void;
  departDriverForKeys: () => void;
  resetDriverDeparture: () => void;

  // Computed
  getHourlyRate: () => number;
  getTotalFare: () => number;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
  drivers: MOCK_DRIVERS,
  selectedCategory: 'standard', // Default is Standard Driver
  selectedDriverId: null,

  bookingStatus: 'idle',
  selectedDuration: 4, // default 4 hours
  bookingMode: 'now',
  scheduledTimestamp: Date.now() + 3600000, // default 1 hour from now
  scheduledDate: 'Oct 28, 2026',
  scheduledTime: '03:15 AM',
  matchedDriver: null,
  isDriverDeparted: false,

  setCategory: (category: FilterCategory) => {
    set(state => {
      const currentSelected = state.drivers.find(d => d.id === state.selectedDriverId);
      const shouldClearSelection =
        category !== 'all' && currentSelected && currentSelected.type !== category;

      return {
        selectedCategory: category,
        selectedDriverId: shouldClearSelection ? null : state.selectedDriverId,
      };
    });
  },

  togglePremium: () => {
    set(state => {
      const nextCategory: FilterCategory =
        state.selectedCategory === 'premium' ? 'standard' : 'premium';
      return {
        selectedCategory: nextCategory,
        selectedDriverId: null,
      };
    });
  },

  selectDriver: (driverId: string | null) => {
    set({ selectedDriverId: driverId });
  },

  setDuration: (hours: number) => {
    // Support multi-day chauffeur duties up to 168 hours (7 full days)
    const valid = isNaN(hours) ? 1 : Math.max(1, Math.min(168, Math.floor(hours)));
    set({ selectedDuration: valid });
  },

  incrementDuration: () => {
    set(state => ({
      selectedDuration: Math.min(168, state.selectedDuration + 1),
    }));
  },

  decrementDuration: () => {
    set(state => ({
      selectedDuration: Math.max(1, state.selectedDuration - 1),
    }));
  },

  setBookingMode: (mode: 'now' | 'schedule') => {
    set({ bookingMode: mode });
  },

  setScheduledTimestamp: (timestamp: number) => {
    const d = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const timeStr = `${hours}:${minStr} ${ampm}`;

    set({
      scheduledTimestamp: timestamp,
      scheduledDate: dateStr,
      scheduledTime: timeStr,
    });
  },

  setScheduledDate: (date: string) => {
    set({ scheduledDate: date });
  },

  setScheduledTime: (time: string) => {
    set({ scheduledTime: time });
  },

  startBooking: () => {
    const { drivers, selectedCategory, selectedDriverId, bookingMode } = get();

    // Eligible drivers based on tier selection (all, standard, or premium)
    const eligible =
      selectedCategory === 'all'
        ? drivers
        : drivers.filter(d => d.type === selectedCategory);

    // Random driver selection: if user handpicked a pin, keep it; otherwise pick a random driver from the tier!
    let targetDriver: Driver;
    if (selectedDriverId) {
      targetDriver =
        drivers.find(d => d.id === selectedDriverId) ||
        eligible[Math.floor(Math.random() * eligible.length)] ||
        drivers[0];
    } else {
      const randomIndex = Math.floor(Math.random() * eligible.length);
      targetDriver = eligible[randomIndex] || drivers[0];
    }

    set({ bookingStatus: 'searching' });

    // 3.5 seconds Rapido-style radar telemetry search simulation
    setTimeout(() => {
      set({
        bookingStatus: 'confirmed',
        matchedDriver: targetDriver,
        selectedDriverId: targetDriver.id,
        // For Instant dispatch, driver is immediately en route.
        // For Scheduled booking, driver departure is pending until dispatch time / driver departure signal.
        isDriverDeparted: bookingMode === 'now',
      });
    }, 3500);
  },

  cancelBooking: () => {
    set({
      bookingStatus: 'idle',
      matchedDriver: null,
      selectedDriverId: null,
      isDriverDeparted: false,
    });
  },

  departDriverForKeys: () => {
    set({ isDriverDeparted: true });
  },

  resetDriverDeparture: () => {
    set({ isDriverDeparted: false });
  },

  getHourlyRate: () => {
    const { selectedCategory } = get();
    // Standard driver rate: $22/hr, Premium chauffeur rate: $48/hr
    return selectedCategory === 'premium' ? 48 : 22;
  },

  getTotalFare: () => {
    const { selectedDuration, getHourlyRate } = get();
    return selectedDuration * getHourlyRate();
  },
}));
