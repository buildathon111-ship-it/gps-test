function Card({ title, icon, action, children, className = '', padded = true, tone = 'default' }) {
    const toneClasses = tone === 'dark'
        ? 'bg-primary text-on-primary border-primary'
        : 'bg-surface-container-lowest text-on-surface border-outline-variant/40';

    return (
        <div className={`rounded-2xl border shadow-sm ${toneClasses} ${padded ? 'p-5' : ''} ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h3 className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${tone === 'dark' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                            {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
                            {title}
                        </h3>
                    )}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

export default Card;
