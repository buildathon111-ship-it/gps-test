import { useState } from 'react';

const TONE_CLASSES = {
    primary: 'bg-primary text-on-primary',
    error: 'bg-error text-on-error',
    secondary: 'bg-surface-container-high text-on-surface',
};

// Idle -> loading -> success button, used anywhere a tap dispatches a
// command that takes a moment to confirm (irrigation start/stop, pump
// stop, save boundary). Gives touch users clear feedback instead of a
// button that just... does nothing visibly for a second.
function StatefulButton({ children, successLabel = 'Done', onAction, tone = 'primary', className = '' }) {
    const [state, setState] = useState('idle'); // idle | loading | success

    async function handleClick() {
        if (state !== 'idle') return;
        setState('loading');
        try {
            await onAction?.();
        } finally {
            setState('success');
            setTimeout(() => setState('idle'), 1400);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={state !== 'idle'}
            className={`relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.97] disabled:cursor-default ${TONE_CLASSES[tone]} ${className}`}
        >
            {state === 'idle' && children}
            {state === 'loading' && (
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {state === 'success' && (
                <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {successLabel}
                </span>
            )}
        </button>
    );
}

export default StatefulButton;
