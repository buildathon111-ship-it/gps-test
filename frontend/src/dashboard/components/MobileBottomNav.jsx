import { NavLink } from 'react-router-dom';

const ITEMS = [
    { to: '/', label: 'Overview', icon: 'grid_view', end: true },
    { to: '/field-map', label: 'Map', icon: 'map' },
    { to: '/alerts', label: 'Alerts', icon: 'notifications' },
    { to: '/reports', label: 'Reports', icon: 'bar_chart' },
];

function MobileBottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around bg-surface-container-lowest border-t border-outline-variant/40 pb-[env(safe-area-inset-bottom)]">
            {ITEMS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide ${
                            isActive ? 'text-secondary' : 'text-on-surface-variant'
                        }`
                    }
                >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
}

export default MobileBottomNav;
