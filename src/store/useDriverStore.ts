import { create } from 'zustand';
import { Driver, FilterCategory } from '../types/driver';
import { MOCK_DRIVERS } from '../api/mockDrivers';

interface DriverStoreState {
  drivers: Driver[];
  selectedCategory: FilterCategory;
  selectedDriverId: string | null;

  // Actions
  setCategory: (category: FilterCategory) => void;
  selectDriver: (driverId: string | null) => void;
  
  // Selectors
  getFilteredDrivers: () => Driver[];
  getSelectedDriver: () => Driver | undefined;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
  drivers: MOCK_DRIVERS,
  selectedCategory: 'all',
  selectedDriverId: null,

  setCategory: (category: FilterCategory) => {
    set(state => {
      // If the currently selected driver does not belong to the new category, deselect them
      const currentSelected = state.drivers.find(d => d.id === state.selectedDriverId);
      const shouldClearSelection =
        category !== 'all' && currentSelected && currentSelected.type !== category;

      return {
        selectedCategory: category,
        selectedDriverId: shouldClearSelection ? null : state.selectedDriverId,
      };
    });
  },

  selectDriver: (driverId: string | null) => {
    set({ selectedDriverId: driverId });
  },

  getFilteredDrivers: () => {
    const { drivers, selectedCategory } = get();
    if (selectedCategory === 'all') {
      return drivers;
    }
    return drivers.filter(d => d.type === selectedCategory);
  },

  getSelectedDriver: () => {
    const { drivers, selectedDriverId } = get();
    return drivers.find(d => d.id === selectedDriverId);
  },
}));
