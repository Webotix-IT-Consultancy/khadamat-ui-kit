import React from 'react';
import PopupPrimary from '../popups/PopupPrimary';
import Button from '../Button/Button';
import Track, { type TrackProps } from './Track';
import './Track.css';

/**
 * Re-exported so a caller needs ONE import: the popup and the shapes it is fed.
 * `Track` itself is the timeline without the chrome, for a screen that embeds one.
 */
export type { TrackStep, TrackGroup, TrackChip, TrackTone, TrackProps } from './Track';

export interface TrackPopupProps extends TrackProps {
    open: boolean;
    onClose: () => void;
    /** The cream band's heading — "Track", translated by the caller. */
    title: string;
    /** A second line under it: the record's reference. Hidden when absent. */
    subtitle?: string;
    /** The single footer control. Translated by the caller (`common:buttons.cancel`). */
    closeLabel: string;
    /** `sm` for one timeline, `md` for per-job groups. */
    width?: 'sm' | 'md' | 'lg';
}

/**
 * **The Track popup — the timeline plus the chrome every Track screen draws around it.**
 *
 * The design is the same in both portals and in all five modules that have one: the cream
 * header band (not `PopupPrimary`'s bordered title), the timeline, and a single Cancel. It is
 * read-only — there is nothing to submit — so Cancel is the only control, exactly as the mocks
 * draw it.
 *
 * Everything the timeline itself needs is forwarded to `Track`; read that file's header for the
 * contract (the caller resolves translations, dates and status colours; this renders).
 *
 * ```tsx
 * import TrackPopup from '@khadamat/ui-kit/components/Track/TrackPopup';
 *
 * <TrackPopup
 *     open={open}
 *     onClose={onClose}
 *     title={t('track.title')}
 *     subtitle={request?.requestId}
 *     closeLabel={t('common:buttons.cancel')}
 *     loading={loading}
 *     groups={jobs}
 *     emptyMessage={t('track.empty')}
 *     width="md"
 * />
 * ```
 */
const TrackPopup: React.FC<TrackPopupProps> = ({
    open,
    onClose,
    title,
    subtitle,
    closeLabel,
    width = 'sm',
    ...track
}) => (
    <PopupPrimary open={open} onClose={onClose} width={width}>
        <div className="space-y-6">
            {/* The design's own cream header band, not PopupPrimary's bordered title. */}
            <div className="rounded-xl bg-primary-light px-6 py-4">
                <h2 className="text-center text-xl font-semibold text-foreground">{title}</h2>
                {subtitle && <p className="mt-1 text-center text-sm text-[#919191]">{subtitle}</p>}
            </div>

            <Track {...track} />

            <div className="flex justify-end">
                <Button variant="outline" size="small" onClick={onClose}>
                    {closeLabel}
                </Button>
            </div>
        </div>
    </PopupPrimary>
);

export default TrackPopup;
