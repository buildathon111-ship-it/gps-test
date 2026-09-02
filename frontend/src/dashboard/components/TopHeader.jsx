import { rover, SIMULATION_MODE } from '../data/simulation';

function TopHeader({ title, subtitle }) {
    const now = new Date();
    const syncTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 bg-surface/90 backdrop-blur-md border-b border-outline-variant/40">
            <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm md:text-base font-semibold text-on-surface truncate">{title ?? 'Good morning, Commander'}</span>
                {subtitle && <span className="text-xs text-on-surface-variant truncate">{subtitle}</span>}
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    {rover.connectionStatus === 'ONLINE' ? 'Rover Online' : 'Rover Offline'}
                </span>
                <span className="hidden lg:flex flex-col items-end text-[10px] text-on-surface-variant leading-tight">
                    <span className="uppercase font-bold tracking-wide">Sync Time</span>
                    <span className="font-mono-data">{syncTime}</span>
                </span>
                {SIMULATION_MODE && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-primary text-on-primary">
                        <span className="material-symbols-outlined text-[14px]">science</span>
                        Simulation Mode
                    </span>
                )}
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
            </div>
        </header>
    );
}

export default TopHeader;
