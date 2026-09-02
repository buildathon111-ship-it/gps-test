const TONE_DOT = {
    good: 'bg-secondary',
    warn: 'bg-warning',
    bad: 'bg-error',
    neutral: 'bg-outline',
    info: 'bg-tertiary',
};

const TONE_BG = {
    good: 'bg-secondary-container text-on-secondary-container',
    warn: 'bg-warning-container text-on-warning-container',
    bad: 'bg-error-container text-on-error-container',
    neutral: 'bg-surface-container-high text-on-surface-variant',
    info: 'bg-tertiary-container text-on-tertiary-container',
};

function StatusPill({ label, tone = 'neutral' }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${TONE_BG[tone]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[tone]}`} />
            {label}
        </span>
    );
}

export default StatusPill;
