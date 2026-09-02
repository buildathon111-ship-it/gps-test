// Simulated telemetry for the dashboard UI. Shaped to mirror the backend's
// domain vocabulary (backend/domain/*.js: device types, telemetry envelope
// categories) so that swapping this for real API data later is a data-source
// change, not a UI rewrite. Every value here is synthetic — the SIMULATION
// MODE badge in the header must stay visible wherever this data is shown.

export const SIMULATION_MODE = true;

export const rover = {
    deviceId: 'rover-01',
    name: 'AGRIVISION ROVER 01',
    connectionStatus: 'ONLINE',
    mode: 'MANUAL',
};

export const power = {
    voltage: 7.82,
    current: 1.42,
    power: 11.1,
    estimatedBatteryPercent: 74,
    source: 'INA219',
    nodeId: 'motor-node-01',
};

export const gps = {
    latitude: 34.0537,
    longitude: -118.2412,
    fix: 'FIXED',
    speed: 0.8,
    heading: 184,
    satellites: 9,
    hdop: 1.2,
    source: 'NEO-6M',
    nodeId: 'sensor-node-01',
};

export const environment = {
    airTemp: { value: 31.4, unit: '°C', source: 'DHT22', nodeId: 'sensor-node-01', ts: '14:23:05' },
    humidity: { value: 68, unit: '%', source: 'DHT22', nodeId: 'sensor-node-01', ts: '14:23:05' },
    rain: { detected: false, raw: 812, source: 'Rain Drop Sensor', nodeId: 'sensor-node-01', ts: '14:23:05' },
    wind: { value: 12, unit: 'km/h', source: 'Open-Meteo', ts: '14:22:15' },
    soilMoisture: { raw: 812, calibratedPercent: 42, calibrated: true, source: 'Soil Moisture Sensor', nodeId: 'sensor-node-01', ts: '14:21:58' },
    light: { detected: true, raw: 720, source: 'LDR', nodeId: 'sensor-node-01', ts: '14:23:05' },
};

export const obstacle = {
    front: 1.8,
    left: 2.4,
    right: 3.1,
    rear: 4.2,
};

export const zones = [
    { id: 'A1', name: 'Zone A1', health: 92, moisture: 42, status: 'good', label: 'Optimal' },
    { id: 'A2', name: 'Zone A2', health: 72, moisture: 26, status: 'bad', label: 'Attention Required' },
    { id: 'A3', name: 'Zone A3', health: 65, moisture: 35, status: 'warn', label: 'Stress' },
    { id: 'B1', name: 'Zone B1', health: 80, moisture: 45, status: 'good', label: 'Optimal' },
];

export const riskScores = {
    aggregate: 18,
    heatStress: { value: 41, label: 'ELEVATED' },
    waterStress: { value: 37, label: 'MODERATE' },
    droughtRisk: { value: 22, label: 'LOW' },
    vegStress: { value: 19, label: 'OPTIMAL' },
    explain: [
        { icon: 'trending_up', label: 'Temp Forecast', detail: 'Forecast models indicate consecutive days +4°C above seasonal average.' },
        { icon: 'water', label: 'Low Soil Moisture', detail: 'Soil moisture in Zone A2 has dropped below the 30% threshold.' },
        { icon: 'air', label: 'Elevated ET₀', detail: 'High solar radiation combined with wind increasing soil moisture loss.' },
        { icon: 'cloud', label: 'Rain Probability', detail: 'Rain probability below 20% for the next 72 hours.' },
    ],
};

export const alerts = [
    { id: 1, severity: 'bad', icon: 'coronavirus', title: 'Possible disease detected', body: 'AI Vision analysis indicates high probability (92% confidence) of leaf rust in Zone A3.', zone: 'A3', time: '10:42 AM', meta: 'AI Conf: 92%' },
    { id: 2, severity: 'warn', icon: 'water_drop', title: 'Low soil moisture', body: 'Sensors report moisture levels have dropped to 23% in the secondary growth zone.', zone: 'A2', time: '08:15 AM', meta: 'Current: 23%' },
    { id: 3, severity: 'info', icon: 'agriculture', title: 'Rover completed field scan', body: 'Autonomous Unit Alpha completed its scheduled perimeter and health scan covering 450 acres.', time: 'Yesterday, 18:00' },
    { id: 4, severity: 'info', icon: 'sync', title: 'Weather data synchronized', body: 'Local meteorological station data successfully merged with central database.', time: 'Yesterday, 14:30' },
];

export const detections = [
    { label: 'Disease - Zone A3', confidence: 92, icon: 'coronavirus' },
    { label: 'Pest - Zone B1', confidence: 87, icon: 'bug_report' },
    { label: 'Water Stress - Zone A2', confidence: 81, icon: 'water_drop' },
];

export const roverLog = [
    { icon: 'my_location', title: 'Scan Started', detail: 'Entering Zone A2', time: '14:20:00' },
    { icon: 'warning', title: 'Anomaly Detected', detail: 'Low moisture signature', time: '14:22:15', tone: 'bad' },
    { icon: 'sync', title: 'Telemetry Sync', detail: 'Packet received', time: '14:23:05' },
];

export const irrigationZones = [
    { id: 'A1', moisture: 42, status: 'good', label: 'Optimal', action: 'Start' },
    { id: 'A2', moisture: 28, status: 'bad', label: 'Needs Water', action: 'Start' },
    { id: 'A3', moisture: 55, status: 'info', label: 'Irrigating', action: 'Stop' },
    { id: 'B1', moisture: 45, status: 'good', label: 'Optimal', action: 'Start' },
];

export const pump = {
    state: 'IDLE',
    totalRuntimeToday: '1.4h',
    lastActivation: '10:45:12',
    safetyTimeoutMinutes: 30,
};

export const irrigationHistory = [
    { zone: 'A2', start: 'Today 08:15', duration: '8 min', before: 23, after: 31, outcome: 'Successful', delta: '+8%' },
    { zone: 'A3', start: 'Yesterday 14:30', duration: '12 min', before: 19, after: 35, outcome: 'Successful', delta: '+16%' },
    { zone: 'B1', start: 'Yesterday 06:00', duration: '5 min', before: 28, after: 30, outcome: 'Below target', delta: '+2%' },
    { zone: 'A1', start: '2 days ago 09:45', duration: '10 min', before: 21, after: 33, outcome: 'Successful', delta: '+12%' },
];

export const cropIssues = [
    { issue: 'Early Blight', zone: 'A3', confidence: 92, severity: 'bad', detected: 'Today, 08:30', action: 'Inspect' },
    { issue: 'Aphid Clusters', zone: 'C1', confidence: 78, severity: 'warn', detected: 'Yesterday', action: 'Review Image' },
    { issue: 'Drought Stress', zone: 'B4', confidence: 85, severity: 'warn', detected: 'Oct 28', action: 'Adjust Irrigation' },
];

export const reports = [
    { name: 'Comprehensive Field Health Report', file: 'Q3_2026_FHR.pdf', time: 'Generated 2h ago', icon: 'eco', tone: 'good' },
    { name: 'Weekly Rover Diagnostics & Path Log', file: 'WK42_ROV_LOG.csv', time: 'Compiling data (45%)…', icon: 'sync', tone: 'neutral' },
    { name: 'Pest & Disease Incidence Log', file: 'PD_INCIDENCE_OCT.pdf', time: 'Generated 1d ago', icon: 'coronavirus', tone: 'bad' },
    { name: 'Irrigation Efficiency Audit', file: 'IRR_AUDIT_24.xlsx', time: 'Generated Oct 12, 2026', icon: 'water_drop', tone: 'info' },
];
