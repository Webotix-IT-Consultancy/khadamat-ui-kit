import React from 'react';
import { Check, X } from 'lucide-react';
import Loader from '../Loader/Loader';
import { cn } from '../../lib/utils';
import './Track.css';

/** A step's node: a green tick, or a red ✕ for a refusal. */
export type TrackTone = 'default' | 'danger';

/** A caption with its value in a pill — "Driver · Sivaprasad", "Truck · DXB 12345". */
export interface TrackChip {
    label: string;
    value: string;
}

/**
 * One step of a timeline.
 *
 * **Everything here is already RESOLVED** — translated, formatted, decided. The component
 * renders strings; it never reads an i18n namespace, a status map or a date locale, because
 * those differ per portal (the customer portal is bilingual and formats dates through
 * `useDisplayDate`; admin is English-only and uses `formatDisplayDate`). A shared component
 * that resolved any of them would have to know which portal it is in.
 */
export interface TrackStep {
    /** React key. Falls back to the index when absent. */
    id?: string;
    /** The step's heading — a translated status label. */
    title: string;
    /** The timestamp, already formatted by the caller. */
    date?: string;
    time?: string;
    /** `danger` draws the ✕ node: a rejection, a refusal. */
    tone?: TrackTone;
    /** A dimmed line under the title — "Reassigned", for instance. */
    note?: string;
    /** Driver, truck, done-by … rendered in order, each as caption + pill. */
    chips?: TrackChip[];
    /** Free text the step carries — a driver's reason on a refusal. */
    message?: string;
    /** `danger` prints the message in the destructive colour. Defaults to the step's `tone`. */
    messageTone?: TrackTone;
}

/**
 * One timeline among several — a JOB of a request.
 *
 * A request for three skips fans out into three independently dispatched jobs sharing one
 * reference (FRD S2.2), so merging their steps into one list would lose which skip each step
 * belongs to. Where a screen has only one timeline, pass `steps` instead.
 */
export interface TrackGroup {
    id?: string;
    /** The job's code, or "Collection 1 of 3" — whatever the caller's reader recognises. */
    title: string;
    /** A small tag beside the title: the board a job is dispatched from, for instance. */
    tag?: string;
    /** Rendered hard right — a `StatusBadge` from the caller, which owns the status→tone map. */
    badge?: React.ReactNode;
    steps: TrackStep[];
    /** Overrides the shared `emptyMessage` for this group only. */
    emptyMessage?: string;
}

export interface TrackProps {
    /** A single timeline. Ignored when `groups` is given. */
    steps?: TrackStep[];
    /** One timeline per job. Takes precedence over `steps`. */
    groups?: TrackGroup[];
    /** Shows the spinner instead of the timeline. */
    loading?: boolean;
    /** What an empty timeline says. Required in practice — there is no English default here. */
    emptyMessage?: string;
    /**
     * Wrap a single timeline in the bordered card (default `true`).
     *
     * Grouped timelines carry their own cards, so this applies to `steps` only.
     */
    panel?: boolean;
    className?: string;
}

const TrackStepRow: React.FC<{ step: TrackStep; isLast: boolean }> = ({ step, isLast }) => {
    const isDanger = step.tone === 'danger';
    const messageTone = step.messageTone ?? step.tone;

    return (
        <li className="track-step">
            {/* The connector, drawn from this node down to the next one. */}
            {!isLast && <span aria-hidden className="track-step-connector" />}

            <span className={cn('track-step-node', isDanger && 'track-step-node-danger')}>
                {isDanger ? <X size={18} strokeWidth={3} /> : <Check size={18} strokeWidth={3} />}
            </span>

            <div className="track-step-body">
                <div className="track-step-main">
                    <p className="track-step-title">{step.title}</p>
                    {step.note && <p className="track-step-note">{step.note}</p>}

                    {!!step.chips?.length && (
                        <div className="track-step-chips">
                            {step.chips.map((chip) => (
                                <span key={`${chip.label}-${chip.value}`} className="track-step-chip">
                                    {chip.label}
                                    <span className="track-step-chip-value">{chip.value}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {step.message && (
                        <p
                            className={cn(
                                'track-step-message',
                                messageTone === 'danger' && 'track-step-message-danger',
                            )}
                        >
                            {step.message}
                        </p>
                    )}
                </div>

                {(step.date || step.time) && (
                    <div className="track-step-time">
                        {step.date && <p>{step.date}</p>}
                        {step.time && <p>{step.time}</p>}
                    </div>
                )}
            </div>
        </li>
    );
};

const StepList: React.FC<{ steps: TrackStep[] }> = ({ steps }) => (
    <ol className="track-list">
        {steps.map((step, index) => (
            <TrackStepRow
                key={step.id ?? `${step.title}-${step.date ?? ''}-${index}`}
                step={step}
                isLast={index === steps.length - 1}
            />
        ))}
    </ol>
);

/**
 * **The Track timeline — one component for both portals.**
 *
 * Every dispatch, mobilisation, demobilisation and on-call screen shows the same thing: nodes
 * joined by a connector, newest first, a red ✕ where a driver refused, driver / truck pills,
 * and the date over the time on the trailing edge. It existed as FIVE near-identical copies
 * (admin mobilisation, demobilisation, dispatch, on-call; customer on-call), three of which
 * carried a comment asking for exactly this promotion.
 *
 * ## The contract: the caller resolves, this renders
 *
 * Steps arrive already translated and already formatted. That is the whole reason one component
 * can serve two portals — admin is English-only and formats with `formatDisplayDate`, while the
 * customer portal is bilingual, mirrors in Arabic and formats through `useDisplayDate`. A shared
 * component cannot know which it is in, so it is given strings, and a `badge` node for the one
 * piece that needs a portal's own status→tone map.
 *
 * **Order is the caller's too.** The timeline renders what it is handed, in that order, and
 * never synthesises or sorts a step — an event a module does not model as a status still shows,
 * under the server's own wording.
 *
 * ```tsx
 * import Track from '@khadamat/ui-kit/components/Track/Track';
 *
 * <Track
 *     steps={history.map((entry) => ({
 *         title: t(STATUS_LABEL_KEY[entry.status] ?? entry.status),
 *         date: formatDisplayDate(entry.at),
 *         time: formatDisplayTime(entry.at),
 *         tone: entry.status === 'rejected' ? 'danger' : 'default',
 *         chips: entry.driverName ? [{ label: t('track.driver'), value: entry.driverName }] : [],
 *         message: entry.reason,
 *     }))}
 *     emptyMessage={t('track.empty')}
 * />
 * ```
 *
 * For the popup chrome around it — the cream header band and the Cancel button every one of
 * those five screens also duplicated — use `TrackPopup` beside this file.
 */
const Track: React.FC<TrackProps> = ({
    steps,
    groups,
    loading,
    emptyMessage,
    panel = true,
    className,
}) => {
    if (loading) {
        return (
            <div className={cn('track-loading', className)}>
                <Loader />
            </div>
        );
    }

    if (groups?.length) {
        return (
            <div className={cn('track-groups', className)}>
                {groups.map((group, index) => (
                    <section key={group.id ?? `${group.title}-${index}`} className="track-panel">
                        <header className="track-group-header">
                            <span className="track-group-title">
                                {group.title}
                                {group.tag && <span className="track-group-tag">{group.tag}</span>}
                            </span>
                            {group.badge}
                        </header>

                        {group.steps.length ? (
                            <StepList steps={group.steps} />
                        ) : (
                            <p className="track-empty">{group.emptyMessage ?? emptyMessage}</p>
                        )}
                    </section>
                ))}
            </div>
        );
    }

    const body = steps?.length ? (
        <StepList steps={steps} />
    ) : (
        <p className="track-empty">{emptyMessage}</p>
    );

    return panel ? <div className={cn('track-panel', className)}>{body}</div> : <div className={className}>{body}</div>;
};

export default Track;
