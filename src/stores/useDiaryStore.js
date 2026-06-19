import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDiaryStore = create(
  persist(
    (set) => ({
      /** Mobile sidebar overlay open/closed */
      sidebarOpen: false,
      /** Dark mode */
      darkMode: false,

      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'diary-ui' },
  ),
)
