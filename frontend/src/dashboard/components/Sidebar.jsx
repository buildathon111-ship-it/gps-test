import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
    { to: '/', label: 'Overview', icon: 'grid_view', end: true },
    { to: '/field-map', label: 'Field Map', icon: 'map' },
    { to: '/gps-mapping', label: 'GPS Mapping', icon: 'my_location' },
    { to: '/rover', label: 'Rover Control', icon: 'precision_manufacturing' },
    { to: '/ai-vision', label: 'AI Vision', icon: 'visibility' },
    { to: '/crop-health', label: 'Crop Health', icon: 'eco' },
    { to: '/environment', label: 'Environment', icon: 'thermostat' },
    { to: '/irrigation', label: 'Irrigation', icon: 'water_drop' },
    { to: '/risk', label: 'Risk Intel', icon: 'shield' },
    { to: '/alerts', label: 'Alerts', icon: 'notifications' },
    { to: '/reports', label: 'Reports', icon: 'bar_chart' },
];

function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-surface-container-lowest border-r border-outline-variant/40">
            <div className="h-16 flex items-center gap-2.5 px-5 border-b border-outline-variant/30">
                <span className="text-2xl">🌾</span>
                <span className="font-headline text-lg font-extrabold tracking-wide text-primary">AGRIVISION</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'text-on-surface-variant hover:bg-surface-container'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 border-t border-outline-variant/30 flex flex-col gap-1">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Settings
                </button>
                <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl bg-surface-container">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-on-surface">Commander</span>
                        <span className="text-[11px] text-on-surface-variant">Admin</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
