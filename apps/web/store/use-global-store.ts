import { create } from 'zustand';

interface GlobalState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    isFilterOpen: boolean;
    toggleFilter: () => void;
    setFilterOpen: (isOpen: boolean) => void;

    isMapView: boolean;
    toggleMapView: () => void;
    setMapView: (isMap: boolean) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    isFilterOpen: false,
    toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
    setFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),

    isMapView: false,
    toggleMapView: () => set((state) => ({ isMapView: !state.isMapView })),
    setMapView: (isMap) => set({ isMapView: isMap }),
}));
