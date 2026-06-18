import { create } from 'zustand'

export const useDiaryStore = create((set) => ({
  /** Mobile sidebar overlay open/closed */
  sidebarOpen: false,

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
