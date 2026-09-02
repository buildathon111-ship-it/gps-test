import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MapTracking from './pages/MapTracking';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<MapTracking />} />
            </Routes>
        </>
    );
}

export default App;
