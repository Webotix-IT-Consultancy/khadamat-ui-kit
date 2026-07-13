import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleMobile: () => void;
    setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            // Default states based on screen size will be handled in a useEffect in the Layout
            isCollapsed: false,
            isMobileOpen: false,

            toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
            setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
            toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
            setMobileOpen: (open) => set({ isMobileOpen: open }),
        }),
        {
            name: 'sidebar-storage',
        }
    )
);
