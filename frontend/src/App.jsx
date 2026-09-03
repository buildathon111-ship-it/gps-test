import { Routes, Route } from 'react-router-dom';
import MapTracking from './pages/MapTracking';
import DashboardLayout from './dashboard/components/DashboardLayout';
import Overview from './dashboard/pages/Overview';
import FieldMap from './dashboard/pages/FieldMap';
import RoverControl from './dashboard/pages/RoverControl';
import AIVision from './dashboard/pages/AIVision';
import CropHealth from './dashboard/pages/CropHealth';
import Environment from './dashboard/pages/Environment';
import Irrigation from './dashboard/pages/Irrigation';
import RiskIntel from './dashboard/pages/RiskIntel';
import Alerts from './dashboard/pages/Alerts';
import Reports from './dashboard/pages/Reports';

function App() {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/field-map" element={<FieldMap />} />
                <Route path="/gps-mapping" element={<MapTracking />} />
                <Route path="/rover" element={<RoverControl />} />
                <Route path="/ai-vision" element={<AIVision />} />
                <Route path="/crop-health" element={<CropHealth />} />
                <Route path="/environment" element={<Environment />} />
                <Route path="/irrigation" element={<Irrigation />} />
                <Route path="/risk" element={<RiskIntel />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />
            </Route>
        </Routes>
    );
}

export default App;
