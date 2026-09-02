const TONE_STROKE = {
    good: 'stroke-secondary',
    warn: 'stroke-warning',
    bad: 'stroke-error',
    neutral: 'stroke-on-surface-variant',
};

// Circular SVG progress ring — inspired by habit-tracker / weather-app score
// displays (Godly.design research): a single glanceable number reads faster
// on a phone than a stat tile, especially for 0-100 scores.
function RadialGauge({ value, max = 100, label, tone = 'good', size = 128, stroke = 10 }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(1, Math.max(0, value / max));
    const offset = circumference * (1 - pct);

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    strokeWidth={stroke}
                    className="fill-none stroke-surface-container-high"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`fill-none ${TONE_STROKE[tone]} transition-[stroke-dashoffset] duration-700 ease-out`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-2xl font-extrabold text-on-surface leading-none">{value}</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">/{max}</span>
                {label && <span className="text-[9px] font-bold uppercase text-on-surface-variant mt-1 tracking-wide">{label}</span>}
            </div>
        </div>
    );
}

export default RadialGauge;
