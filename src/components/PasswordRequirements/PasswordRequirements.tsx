import React from 'react';
import { Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_RULES,
    passwordRuleState,
} from '../../utils/passwordPolicy';
import './PasswordRequirements.css';

interface PasswordRequirementsProps {
    /** The password as typed. The component derives the rule state itself. */
    value?: string;
    /**
     * Colour the rules that are still unmet as errors. Callers pass their "field has been
     * touched" flag: before the user has typed anything, five red lines are noise, not help.
     */
    showUnmet?: boolean;
    /** Heading above the list. Omit to render the list alone. */
    title?: string;
    /** Colour the heading as an error (the customer screen does this once the field fails). */
    titleError?: boolean;
    className?: string;
}

/**
 * The live "your password must contain…" checklist, shared by every set / change / reset
 * password screen in both portals (KP1-I148).
 *
 * Two things it fixes by existing:
 *
 * 1. **It reads as a list.** The customer screens rendered a check mark ONLY on a satisfied
 *    rule, so the default state was five unmarked lines of text that read as prose — which is
 *    what the ticket reports. Every row now carries a marker in both states, a bullet while
 *    unmet and a check once met, in a fixed-width slot so the label does not jump sideways
 *    the moment a rule turns green. That is the admin portal's fix (KP1-I23), promoted here
 *    rather than copied a third time.
 *
 * 2. **The rules cannot disagree between screens.** Rows, labels and the minimum all come
 *    from `utils/passwordPolicy`, which is checked against the server. The four screens used
 *    to restate them by hand and disagreed with each other and with the API.
 *
 * Labels resolve from the shared `auth:setPassword.requirements.*` bundle, which both portals
 * load, so the caller passes only the password.
 */
const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    value,
    showUnmet = false,
    title,
    titleError = false,
    className = '',
}) => {
    const { t } = useTranslation(['auth']);
    const rules = passwordRuleState(value);

    return (
        <div className={`pw-req ${className}`.trim()}>
            {title && (
                <p className={`pw-req-title${titleError ? ' pw-req-title-error' : ''}`}>{title}</p>
            )}
            <ul className="pw-req-list">
                {PASSWORD_RULES.map(({ key, labelKey }) => {
                    const met = rules[key];
                    return (
                        <li
                            key={key}
                            className={`pw-req-item${met ? ' met' : ''}${!met && showUnmet ? ' unmet' : ''}`}
                        >
                            <span className="pw-req-marker" aria-hidden="true">
                                {met ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <Circle size={6} fill="currentColor" />
                                )}
                            </span>
                            <span>{t(labelKey, { count: PASSWORD_MIN_LENGTH })}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PasswordRequirements;
