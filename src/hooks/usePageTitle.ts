import { useEffect } from 'react';
import { usePageStore } from '@/store/usePageStore';

interface Breadcrumb {
    label: string;
    path?: string;
}

export const usePageTitle = (title: string, breadcrumbs: Breadcrumb[] = []) => {
    const { setTitle, setBreadcrumbs, title: currentTitle, breadcrumbs: currentBreadcrumbs } = usePageStore();

    useEffect(() => {
        if (title !== currentTitle) {
            setTitle(title);
        }

        // Deep compare breadcrumbs to prevent infinite loops from array literals
        if (JSON.stringify(breadcrumbs) !== JSON.stringify(currentBreadcrumbs)) {
            setBreadcrumbs(breadcrumbs);
        }
    }, [title, breadcrumbs, setTitle, setBreadcrumbs, currentTitle, currentBreadcrumbs]);
};
