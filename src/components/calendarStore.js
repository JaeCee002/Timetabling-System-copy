// calendarStore.js
import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  calendarApi: null,
  setCalendarApi: (api) => set({ calendarApi: api }),
}));
