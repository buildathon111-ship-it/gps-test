import { NavLink, useLocation } from 'react-router-dom';

const ITEMS = [
    { to: '/', label: 'Overview', icon: 'grid_view', end: true },
    { to: '/field-map', label: 'Map', icon: 'map' },
    { to: '/alerts', label: 'Alerts', icon: 'notifications' },
    { to: '/reports', label: 'Reports', icon: 'bar_chart' },
];

function MobileBottomNav() {
    const { pathname } = useLocation();
    const activeIndex = Math.max(0, ITEMS.findIndex((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to))));

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/40 pb-[env(safe-area-inset-bottom)]">
            <div className="relative flex items-stretch justify-around">
                <span
                    className="nav-pill-indicator absolute top-1.5 left-0 h-9 w-1/4 p-1.5"
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                >
                    <span className="block w-full h-full rounded-full bg-secondary-container" />
                </span>
                {ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default MobileBottomNav;
