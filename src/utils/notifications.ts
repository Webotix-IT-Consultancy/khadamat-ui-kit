/**
 * The in-app (bell) notification model, shared by both portals.
 *
 * The SERVER decides who is notified, when, and with which words: `title` and `body` arrive
 * already rendered from a template (Khadamat Notification Matrix, 116 scenarios). The client
 * only has to show a notification, colour it by the matrix's "Type of Notification", and open
 * the record it is about. This file is the pure half of that — no HTTP. Each portal owns its
 * own service (on its own axios instance) and its own route map, because the two portals open
 * the same record at different paths.
 *
 * Endpoints (live swagger, :804), all scoped to the CALLER — another user's id is a 404:
 *   GET  /notifications                 ?PageNumber&PageSize&IsRead&NotificationType&SearchTerm
 *   GET  /notifications/unread          ?PageNumber&PageSize
 *   GET  /notifications/unread-count    -> { count }   (cached server-side; safe to poll)
 *   GET  /notifications/{id}
 *   POST /notifications/{id}/read       (idempotent)
 *   POST /notifications/read-all        -> { markedCount }
 *
 * ⚠ OPEN WITH THE BACKEND: the `NotificationTypes` keys and the `payloadJson` shape per type
 * are not published. Until they are, the tone and the target module are INFERRED from words
 * in the type key and from the id fields present in the payload (`toneOf`, `moduleOf`). A
 * notification neither matches keeps the neutral tone and simply opens nothing — it is still
 * shown and still marked read, so an unknown type degrades, it never disappears. When the key
 * list arrives, replace the keyword tables below with an explicit `type -> { tone, module }`
 * map; nothing outside this file needs to change.
 */

/** `NotificationPriority` — swagger publishes bare integers 0-3; assumed Low → Critical. */
export type NotificationPriority = 0 | 1 | 2 | 3;

/** The wire shape, `NotificationDto`. */
export interface NotificationDto {
    id: number | string;
    notificationType?: string | null;
    title?: string | null;
    body?: string | null;
    priority?: NotificationPriority | number | null;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
    payloadJson?: string | null;
}

/** The matrix's "Type of Notification" column — what the colour and the icon say. */
export type NotificationTone = 'success' | 'action' | 'alert' | 'warning' | 'reminder' | 'info';

/** Which record family a notification is about — the portal maps it to a route. */
export type NotificationModule =
    | 'account'
    | 'enquiry'
    | 'contract'
    | 'cancellation'
    | 'quotation'
    | 'invoice'
    | 'salesReturn'
    | 'receipt'
    | 'proofOfPayment'
    | 'wallet'
    | 'cheque'
    | 'mobilisation'
    | 'demobilisation'
    | 'onCall'
    | 'job'
    | 'workflow'
    | 'skip'
    | 'damagedSkip'
    | 'priceBook'
    | 'financeThreshold'
    | 'user';

export interface AppNotification {
    /** Always a string in the UI (the API's int64 can exceed `Number.MAX_SAFE_INTEGER`). */
    id: string;
    type: string;
    title: string;
    body: string;
    priority: number;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    tone: NotificationTone;
    module: NotificationModule | null;
    /** The parsed `payloadJson`, or `{}` — never null, so lookups need no guard. */
    payload: Record<string, unknown>;
}

const parsePayload = (raw?: string | null): Record<string, unknown> => {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

/**
 * Read a payload field by any of several names, case-insensitively, at the top level or one
 * level down — the template model's casing is the server's (`ContractId` / `contractId`) and
 * some models nest the record (`{ Contract: { Id } }`). Returns a string or `undefined`.
 */
export const payloadValue = (payload: Record<string, unknown>, ...names: string[]): string | undefined => {
    const wanted = names.map((n) => n.toLowerCase());
    const pick = (obj: Record<string, unknown>): string | undefined => {
        for (const [key, value] of Object.entries(obj)) {
            if (wanted.includes(key.toLowerCase()) && value != null && value !== '' && typeof value !== 'object') {
                return String(value);
            }
        }
        return undefined;
    };
    const top = pick(payload);
    if (top) return top;
    for (const value of Object.values(payload)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const nested = pick(value as Record<string, unknown>);
            if (nested) return nested;
        }
    }
    return undefined;
};

/*
 * Tone keywords, checked in order — the first match wins, so the more specific rules come
 * first ("NotApproved" is an alert before "Approved" can call it a success). Matched against
 * the type key with separators removed, case-insensitively.
 */
const TONE_RULES: Array<[NotificationTone, RegExp]> = [
    // `cancelled`, not `cancel`: a cancellation REQUEST is Action Required in the matrix.
    ['alert', /reject|notapproved|declin|cancelled|lost|expired|bounc|blocked|negative|exceed|failed|damage(recorded|informed)/],
    ['reminder', /remind|expir|maturity|maturing|notprogress|daily/],
    ['warning', /idle|lowbalance|lowwallet|approaching|unassigned|cutoff|warning|overflow/],
    ['action', /awaiting|approvalrequired|pendingapproval|assign|verify|verification|required|requested|mismatch|uploaded|decision/],
    // Not `created`: the matrix types most "created" rows Information, not Success.
    ['success', /approved|live|completed|delivered|collected|secured|success|cleared|converted|recharged|refund|processed/],
];

/** Tone from the type key; falls back to priority (3 → alert, 2 → action, else info). */
export const toneOf = (type: string, priority: number): NotificationTone => {
    const key = type.replace(/[^a-z]/gi, '').toLowerCase();
    if (key) {
        for (const [tone, pattern] of TONE_RULES) if (pattern.test(key)) return tone;
    }
    if (priority >= 3) return 'alert';
    if (priority === 2) return 'action';
    return 'info';
};

/*
 * Module keywords on the type key, in order (a "ContractCancellation" is a cancellation, a
 * "RenewalContract" a contract). Then, when the key says nothing, the payload's ids decide.
 */
const MODULE_TYPE_RULES: Array<[NotificationModule, RegExp]> = [
    ['cancellation', /cancellation/],
    ['damagedSkip', /damage/],
    ['proofOfPayment', /proofofpayment/],
    ['salesReturn', /salesreturn|creditnote/],
    ['cheque', /cheque|pdc/],
    ['wallet', /wallet|creditlimit|recharge/],
    ['receipt', /receipt/],
    ['invoice', /invoice/],
    ['demobilisation', /demobili/],
    ['mobilisation', /mobili|bindelivery/],
    ['onCall', /oncall|replacement/],
    ['workflow', /workflow/],
    ['job', /job|driver/],
    ['skip', /skip|bin/],
    ['enquiry', /enquiry/],
    ['quotation', /quotation/],
    ['contract', /contract|renewal/],
    // Not a bare `rate`: it would match every "...Generated" key.
    ['priceBook', /pricebook/],
    ['financeThreshold', /threshold/],
    ['user', /user/],
    ['account', /account|tradelicen|registration|document|customer/],
];

/** Payload id field → module, in order of specificity. */
const MODULE_PAYLOAD_RULES: Array<[NotificationModule, string[]]> = [
    ['cancellation', ['cancellationId', 'contractCancellationId']],
    ['damagedSkip', ['damagedSkipId', 'damageReportId', 'reportId']],
    ['proofOfPayment', ['proofOfPaymentId']],
    ['salesReturn', ['salesReturnId']],
    ['invoice', ['invoiceId']],
    ['demobilisation', ['demobilizationRequestId', 'demobilisationRequestId']],
    ['mobilisation', ['mobilizationRequestId', 'mobilisationRequestId']],
    ['onCall', ['onCallRequestId']],
    ['workflow', ['workflowId']],
    ['job', ['jobId', 'operationJobId']],
    ['enquiry', ['enquiryId']],
    ['quotation', ['quotationId']],
    ['contract', ['contractId']],
    ['account', ['customerAccountId', 'customerId']],
];

export const moduleOf = (type: string, payload: Record<string, unknown>): NotificationModule | null => {
    const key = type.replace(/[^a-z]/gi, '').toLowerCase();
    if (key) {
        for (const [module, pattern] of MODULE_TYPE_RULES) if (pattern.test(key)) return module;
    }
    for (const [module, fields] of MODULE_PAYLOAD_RULES) {
        if (payloadValue(payload, ...fields)) return module;
    }
    return null;
};

/**
 * The API's stamps are UTC, but not always marked as such; `new Date()` would read an
 * unmarked `2026-11-12T09:35:00` as LOCAL time and shift it by the machine's offset. Mark it.
 */
const asUtc = (value?: string | null): string | null => {
    if (!value) return null;
    const raw = String(value).trim();
    return /T\d{2}:\d{2}/.test(raw) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(raw) ? `${raw}Z` : raw;
};

export const toNotification = (dto: NotificationDto): AppNotification => {
    const type = dto.notificationType ?? '';
    const priority = Number(dto.priority ?? 1);
    const payload = parsePayload(dto.payloadJson);
    return {
        id: String(dto.id),
        type,
        title: dto.title?.trim() || '',
        body: dto.body?.trim() || '',
        priority,
        isRead: Boolean(dto.isRead),
        readAt: asUtc(dto.readAt),
        createdAt: asUtc(dto.createdAt) ?? '',
        tone: toneOf(type, priority),
        module: moduleOf(type, payload),
        payload,
    };
};

/* ------------------------------------------------------------------------------------------ *
 * Day grouping. Returns KEYS, not labels — the caller translates `today` / `yesterday` and
 * formats a date key through its own date formatter (admin `formatDisplayDate`, customer
 * `useDisplayDate`), the same contract as Track.
 * ------------------------------------------------------------------------------------------ */

/**
 * `YYYY-MM-DD` of an instant in `timeZone` (the admin portal passes `Asia/Dubai`, the zone
 * its every timestamp is shown in), or in the machine's zone when none is given. `en-CA`
 * formats as `YYYY-MM-DD`.
 */
const dayKeyIn = (d: Date, timeZone?: string): string =>
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/** `'today'`, `'yesterday'`, or the `YYYY-MM-DD` of the day. */
export const dayKeyOf = (iso: string, now: Date = new Date(), timeZone?: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'unknown';
    const key = dayKeyIn(date, timeZone);
    if (key === dayKeyIn(now, timeZone)) return 'today';
    // 24h earlier is the previous calendar day in any zone without a DST jump (the UAE has none).
    if (key === dayKeyIn(new Date(now.getTime() - 86_400_000), timeZone)) return 'yesterday';
    return key;
};

export interface NotificationDayGroup<T> {
    key: string;
    items: T[];
}

/** Groups in the order the items arrive (the API sends newest first) — never re-sorted. */
export const groupByDay = <T extends { createdAt: string }>(
    items: T[],
    options: { now?: Date; timeZone?: string } = {},
): NotificationDayGroup<T>[] => {
    const now = options.now ?? new Date();
    const groups: NotificationDayGroup<T>[] = [];
    const index = new Map<string, NotificationDayGroup<T>>();
    for (const item of items) {
        const key = dayKeyOf(item.createdAt, now, options.timeZone);
        let group = index.get(key);
        if (!group) {
            group = { key, items: [] };
            index.set(key, group);
            groups.push(group);
        }
        group.items.push(item);
    }
    return groups;
};
