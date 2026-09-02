import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileBottomNav from './MobileBottomNav';

const PAGE_META = {
    '/': { title: 'Good morning, Commander', subtitle: 'Demo Farm · Sector A · Command Center' },
    '/field-map': { title: 'Field Map', subtitle: 'GIS Intelligence' },
    '/rover': { title: 'Rover Control', subtitle: 'Command Cockpit' },
    '/ai-vision': { title: 'AI Vision', subtitle: 'Real-time Detection' },
    '/crop-health': { title: 'Crop Health', subtitle: 'Analytics Dashboard' },
    '/environment': { title: 'Environment', subtitle: 'Field Intelligence' },
    '/irrigation': { title: 'Irrigation', subtitle: 'Smart Control' },
    '/risk': { title: 'Risk Intelligence', subtitle: 'Early Warning System' },
    '/alerts': { title: 'Alerts', subtitle: 'System Notifications' },
    '/reports': { title: 'Reports', subtitle: 'Field Intelligence' },
};

function DashboardLayout() {
    const { pathname } = useLocation();
    const meta = PAGE_META[pathname] ?? {};

    return (
        <div className="min-h-screen bg-background text-on-background flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopHeader title={meta.title} subtitle={meta.subtitle} />
                <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-[1600px] w-full mx-auto">
                    <div key={pathname} className="route-fade">
                        <Outlet />
                    </div>
                </main>
            </div>
            <MobileBottomNav />
        </div>
    );
}

export default DashboardLayout;
