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
  selectedDuration: number; // in hours: 2, 4, 8, 24
  bookingMode: 'now' | 'schedule';
  scheduledDate: string;
  scheduledTime: string;
  matchedDriver: Driver | null;

  // Actions
  setCategory: (category: FilterCategory) => void;
  togglePremium: () => void;
  selectDriver: (driverId: string | null) => void;
  setDuration: (hours: number) => void;
  setBookingMode: (mode: 'now' | 'schedule') => void;
  setScheduledDate: (date: string) => void;
  setScheduledTime: (time: string) => void;
  startBooking: () => void;
  cancelBooking: () => void;

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
  scheduledDate: 'Today, 28 Oct',
  scheduledTime: '02:00 PM',
  matchedDriver: null,

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
    set({ selectedDuration: hours });
  },

  setBookingMode: (mode: 'now' | 'schedule') => {
    set({ bookingMode: mode });
  },

  setScheduledDate: (date: string) => {
    set({ scheduledDate: date });
  },

  setScheduledTime: (time: string) => {
    set({ scheduledTime: time });
  },

  startBooking: () => {
    const { drivers, selectedCategory, selectedDriverId } = get();

    // Find the driver: either the user-selected one, or the closest available in tier
    let targetDriver: Driver | undefined;
    if (selectedDriverId) {
      targetDriver = drivers.find(d => d.id === selectedDriverId);
    }
    if (!targetDriver) {
      const eligible =
        selectedCategory === 'all'
          ? drivers
          : drivers.filter(d => d.type === selectedCategory);
      targetDriver = eligible[0] || drivers[0];
    }

    set({ bookingStatus: 'searching' });

    // 3.5 seconds Rapido-style search simulation
    setTimeout(() => {
      set({
        bookingStatus: 'confirmed',
        matchedDriver: targetDriver,
        selectedDriverId: targetDriver.id,
      });
    }, 3500);
  },

  cancelBooking: () => {
    set({
      bookingStatus: 'idle',
      matchedDriver: null,
      selectedDriverId: null,
    });
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
