import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../Button/Button';
import { isChunkLoadError } from '../../utils/chunkReload';

/**
 * The page a crash lands on, instead of a white screen.
 *
 * Neither portal had ANY error boundary: a render error in one screen — or, far more often, a
 * lazy route chunk that no longer exists after a deploy — unmounted the whole React tree and
 * left a blank page with no message and no way back. This is the floor under that.
 *
 * Two flavours of the same panel:
 * - **a stale chunk** ("Failed to fetch dynamically imported module") — a new version was
 *   deployed while the tab was open. Nothing is broken; a reload fixes it, so that is what the
 *   copy says and the only thing it offers first.
 * - **anything else** — a genuine bug. Reload, or go back to the dashboard.
 *
 * `homeHref` is navigated with a full page load on purpose: the router itself may be what
 * failed, and a fresh load is the one recovery that cannot depend on it.
 */
export const ErrorFallback: React.FC<{ error?: unknown; homeHref?: string; compact?: boolean }> = ({
    error,
    homeHref = '/dashboard',
    compact = false,
}) => {
    const { t } = useTranslation('common');
    const stale = isChunkLoadError(error);

    return (
        <div
            role="alert"
            className={`flex flex-col items-center justify-center gap-4 text-center px-6 ${compact ? 'py-16' : 'min-h-screen py-10'}`}
        >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-banner text-warning-banner-foreground">
                <AlertTriangle size={28} aria-hidden="true" />
            </span>
            <h1 className="text-xl font-semibold text-foreground">
                {t(stale ? 'errorBoundary.staleTitle' : 'errorBoundary.title')}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
                {t(stale ? 'errorBoundary.staleMessage' : 'errorBoundary.message')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" size="small" onClick={() => window.location.reload()}>
                    <RefreshCw size={16} aria-hidden="true" />
                    {t('errorBoundary.reload')}
                </Button>
                {!stale && (
                    <Button
                        variant="outline-primary"
                        size="small"
                        onClick={() => window.location.assign(homeHref)}
                    >
                        <Home size={16} aria-hidden="true" />
                        {t('errorBoundary.home')}
                    </Button>
                )}
            </div>
        </div>
    );
};

interface ErrorBoundaryProps {
    children: React.ReactNode;
    /**
     * Change it to clear a caught error — pass the route's pathname, so navigating away from a
     * crashed screen (the sidebar still works when this wraps only the page body) renders the
     * new page instead of the old error.
     */
    resetKey?: unknown;
    homeHref?: string;
    /** Inside the dashboard shell: no full-viewport height, the sidebar is still there. */
    compact?: boolean;
}

interface ErrorBoundaryState {
    error: unknown;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        // Kept: in production this is the only trace of what broke.
        console.error('[ErrorBoundary]', error, info?.componentStack);
    }

    componentDidUpdate(prev: ErrorBoundaryProps) {
        if (this.state.error && prev.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    render() {
        if (this.state.error) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    homeHref={this.props.homeHref}
                    compact={this.props.compact}
                />
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
