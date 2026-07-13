import { create } from 'zustand';

interface Breadcrumb {
    label: string;
    path?: string;
}

interface PageState {
    title: string;
    breadcrumbs: Breadcrumb[];
    setTitle: (title: string) => void;
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export const usePageStore = create<PageState>((set) => ({
    title: '',
    breadcrumbs: [],
    setTitle: (title) => set({ title }),
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
