const TONE_STYLES = {
    neutral: 'bg-surface-container',
    good: 'bg-secondary-container',
    warn: 'bg-warning-container',
    bad: 'bg-error-container',
};

const TONE_TEXT = {
    neutral: 'text-on-surface',
    good: 'text-on-secondary-container',
    warn: 'text-on-warning-container',
    bad: 'text-on-error-container',
};

function StatTile({ label, value, unit, tone = 'neutral', caption, sub }) {
    return (
        <div className={`rounded-xl p-4 flex flex-col gap-1.5 ${TONE_STYLES[tone]} ${TONE_TEXT[tone]}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
            <div className="flex items-end gap-1">
                <span className="font-headline text-2xl font-bold leading-none">{value}</span>
                {unit && <span className="text-xs font-medium opacity-70 pb-0.5">{unit}</span>}
            </div>
            {sub && <span className="text-xs opacity-70">{sub}</span>}
            {caption && <span className="text-[10px] opacity-60 mt-1">{caption}</span>}
        </div>
    );
}

export default StatTile;
