import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveBoundary } from '../api/boundaries';
import './MapTracking.css';

const DEFAULT_ZOOM = 18;
const TRACKING_ZOOM = 19;
const FALLBACK_LAT = 20;
const FALLBACK_LNG = 78;

function MapTracking() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const streetLayerRef = useRef(null);
    const satelliteLayerRef = useRef(null);
    const blueDotMarkerRef = useRef(null);
    const markersRef = useRef([]);
    const pathPolylineRef = useRef(null);
    const boundaryPolygonRef = useRef(null);
    const watchIdRef = useRef(null);
    const boundaryPointsRef = useRef([]);
    const followModeRef = useRef(false);
    const locateDebounceRef = useRef(false);
    const logContainerRef = useRef(null);
    const panelExpandedRef = useRef(window.innerWidth >= 900);

    const [isSatellite, setIsSatellite] = useState(false);
    const [followMode, setFollowMode] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [panelExpanded, setPanelExpanded] = useState(window.innerWidth >= 900);
    const [pointCount, setPointCount] = useState(0);
    const [coords, setCoords] = useState({ lat: '--', lng: '--', accuracy: '--' });
    const [totalDistance, setTotalDistance] = useState('0 m');
    const [totalArea, setTotalArea] = useState({ sqm: '0 m²', ha: '0 ha' });
    const [exportEnabled, setExportEnabled] = useState(false);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [logs, setLogs] = useState([{ msg: 'Ready. Tap "Start" to begin tracking.', type: '' }]);
    const [saving, setSaving] = useState(false);

    useEffect(() => { followModeRef.current = followMode; }, [followMode]);
    useEffect(() => { panelExpandedRef.current = panelExpanded; }, [panelExpanded]);

    function addLog(message, type = '') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => {
            const next = [...prev, { msg: `[${time}] ${message}`, type }];
            return next.length > 50 ? next.slice(next.length - 50) : next;
        });
    }

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // ===== Init map (runs once) =====
    useEffect(() => {
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: true,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            maxZoom: 25,
            minZoom: 2,
            zoomAnimation: true
        }).setView([FALLBACK_LAT, FALLBACK_LNG], DEFAULT_ZOOM);
        mapRef.current = map;

        L.control.zoom({ position: 'topleft' }).addTo(map);

        streetLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        satelliteLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 25,
            maxNativeZoom: 18,
            detectRetina: true
        });

        if (navigator.geolocation) {
            addLog('Acquiring GPS fix...', 'info');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    updateBlueDot(latitude, longitude);
                    map.setView([latitude, longitude], DEFAULT_ZOOM, { animate: true, duration: 0.5 });
                    addLog('GPS fix acquired. Map centered on your location.', 'success');
                },
                () => {
                    addLog('GPS unavailable. Showing default location. Tap "Start" to begin.', 'error');
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }

        addLog('Map initialized.', 'info');

        // Guard against the map being sized before the panel/header layout
        // has settled (e.g. web fonts shifting header height on first paint).
        setTimeout(() => map.invalidateSize(), 0);

        const onResize = () => setTimeout(() => map.invalidateSize(), 100);
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            map.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function createPositionIcon() {
        return L.divIcon({
            className: 'position-marker',
            html: `<div class="position-pulse"></div><div class="position-dot"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }

    function updateBlueDot(lat, lng) {
        if (!blueDotMarkerRef.current) {
            blueDotMarkerRef.current = L.marker([lat, lng], {
                icon: createPositionIcon(),
                interactive: false,
                zIndexOffset: 1000
            }).addTo(mapRef.current);
        } else {
            blueDotMarkerRef.current.setLatLng([lat, lng]);
        }
    }

    function removeBlueDot() {
        if (blueDotMarkerRef.current) {
            mapRef.current.removeLayer(blueDotMarkerRef.current);
            blueDotMarkerRef.current = null;
        }
    }

    function toggleMapLayer() {
        const map = mapRef.current;
        if (isSatellite) {
            map.removeLayer(satelliteLayerRef.current);
            streetLayerRef.current.addTo(map);
            setIsSatellite(false);
            addLog('Switched to Street view.', 'info');
        } else {
            map.removeLayer(streetLayerRef.current);
            satelliteLayerRef.current.addTo(map);
            setIsSatellite(true);
            addLog('Switched to Satellite view.', 'info');
        }
    }

    function togglePanel() {
        setPanelExpanded(prev => {
            const next = !prev;
            setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 380);
            return next;
        });
    }

    function centerOnMe() {
        if (locateDebounceRef.current) return;
        locateDebounceRef.current = true;
        setTimeout(() => { locateDebounceRef.current = false; }, 1000);

        const newFollowMode = !followModeRef.current;
        setFollowMode(newFollowMode);

        if (newFollowMode) {
            if (!navigator.geolocation) {
                addLog('GPS not available on this device.', 'info');
                setFollowMode(false);
                return;
            }

            addLog('Follow mode ON — tracking your position.', 'info');

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    updateBlueDot(latitude, longitude);
                    mapRef.current.setView([latitude, longitude], TRACKING_ZOOM, { animate: true, duration: 0.5 });
                },
                (err) => {
                    if (err.code === 1) {
                        addLog('GPS permission denied. Allow location access in browser settings.', 'error');
                    } else {
                        addLog('GPS signal unavailable. Follow mode is on — it will activate when signal is found.', 'info');
                    }
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
            );
        } else {
            removeBlueDot();
            addLog('Follow mode OFF.', 'info');
        }
    }

    function toggleTracking() {
        if (tracking) {
            stopTracking();
        } else {
            startTracking();
        }
    }

    function startTracking() {
        if (!navigator.geolocation) {
            addLog('Geolocation is not supported by your browser.', 'error');
            return;
        }

        setTracking(true);
        addLog('GPS tracking started...', 'info');

        if (!panelExpandedRef.current) {
            togglePanel();
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            onPositionReceived,
            onPositionError,
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
    }

    function stopTracking() {
        setTracking(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        addLog('GPS tracking paused.', 'info');
    }

    function onPositionReceived(position) {
        const { latitude, longitude, accuracy } = position.coords;
        const point = { lat: latitude, lng: longitude };

        setCoords({
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            accuracy: `±${accuracy.toFixed(1)} m`
        });

        if (followModeRef.current) {
            updateBlueDot(latitude, longitude);
        }

        mapRef.current.setView([latitude, longitude], TRACKING_ZOOM, { animate: true, duration: 0.3 });

        boundaryPointsRef.current.push(point);
        setPointCount(boundaryPointsRef.current.length);

        addPointMarker(point);
        drawPath();
        updateDistance();

        addLog(`Point #${boundaryPointsRef.current.length}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, 'success');
    }

    function onPositionError(error) {
        const messages = {
            1: 'Permission denied. Please allow GPS access.',
            2: 'Position unavailable. Check your GPS signal.',
            3: 'GPS timeout. Trying again...'
        };
        addLog(messages[error.code] || 'Unknown GPS error.', 'error');
    }

    function addPointMarker(point) {
        const icon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-dot"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapRef.current);
        markersRef.current.push(marker);

        if (boundaryPointsRef.current.length === 1) {
            addLog(`Boundary start: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`, 'info');
        }
    }

    function drawPath() {
        if (pathPolylineRef.current) {
            mapRef.current.removeLayer(pathPolylineRef.current);
        }

        const latLngs = boundaryPointsRef.current.map(p => [p.lat, p.lng]);
        if (latLngs.length < 2) return;

        pathPolylineRef.current = L.polyline(latLngs, {
            color: '#4ade80',
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 6'
        }).addTo(mapRef.current);
    }

    function haversineDistance(p1, p2) {
        const R = 6371000;
        const dLat = toRad(p2.lat - p1.lat);
        const dLng = toRad(p2.lng - p1.lng);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    function formatDistance(meters) {
        if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
        return `${meters.toFixed(1)} m`;
    }

    function updateDistance() {
        let totalDist = 0;
        const points = boundaryPointsRef.current;
        for (let i = 1; i < points.length; i++) {
            totalDist += haversineDistance(points[i - 1], points[i]);
        }
        setTotalDistance(formatDistance(totalDist));
        return totalDist;
    }

    function calculateArea(points) {
        if (points.length < 3) return 0;

        const latAvg = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const latRad = toRad(latAvg);
        const R = 6371000;

        const coordsXY = points.map(p => ({
            x: toRad(p.lng) * R * Math.cos(latRad),
            y: toRad(p.lat) * R
        }));

        let area = 0;
        for (let i = 0; i < coordsXY.length; i++) {
            const j = (i + 1) % coordsXY.length;
            area += coordsXY[i].x * coordsXY[j].y;
            area -= coordsXY[j].x * coordsXY[i].y;
        }

        return Math.abs(area / 2);
    }

    function formatArea(sqm) {
        if (sqm >= 10000) return `${(sqm / 10000).toFixed(2)} ha`;
        return `${sqm.toFixed(1)} m²`;
    }

    function formatHectares(sqm) {
        return `${(sqm / 10000).toFixed(4)} ha`;
    }

    function finishBoundary() {
        const points = boundaryPointsRef.current;
        if (points.length < 3) {
            addLog('Need at least 3 points to close a boundary.', 'error');
            return;
        }

        stopTracking();

        const latLngs = points.map(p => [p.lat, p.lng]);

        if (boundaryPolygonRef.current) {
            mapRef.current.removeLayer(boundaryPolygonRef.current);
        }

        boundaryPolygonRef.current = L.polygon(latLngs, {
            color: '#4ade80',
            weight: 2,
            fillColor: '#4ade80',
            fillOpacity: 0.15,
            dashArray: null
        }).addTo(mapRef.current);

        if (pathPolylineRef.current) {
            mapRef.current.removeLayer(pathPolylineRef.current);
            pathPolylineRef.current = null;
        }

        pathPolylineRef.current = L.polyline(latLngs, {
            color: '#4ade80',
            weight: 3,
            opacity: 0.9
        }).addTo(mapRef.current);

        const area = calculateArea(points);
        setTotalArea({ sqm: formatArea(area), ha: formatHectares(area) });

        const isMobile = window.innerWidth < 600;
        const padding = isMobile ? [20, 20, 220, 20] : [50, 50, 50, 400];
        mapRef.current.fitBounds(boundaryPolygonRef.current.getBounds(), { padding });

        setExportEnabled(true);
        setSaveEnabled(true);

        addLog(`Boundary closed! Area: ${formatArea(area)} (${formatHectares(area)})`, 'success');
        addLog(`Total points: ${points.length}`, 'info');
    }

    function clearAll() {
        stopTracking();
        setFollowMode(false);
        removeBlueDot();

        if (boundaryPolygonRef.current) {
            mapRef.current.removeLayer(boundaryPolygonRef.current);
            boundaryPolygonRef.current = null;
        }
        if (pathPolylineRef.current) {
            mapRef.current.removeLayer(pathPolylineRef.current);
            pathPolylineRef.current = null;
        }

        markersRef.current.forEach(m => mapRef.current.removeLayer(m));
        markersRef.current = [];

        boundaryPointsRef.current = [];

        setCoords({ lat: '--', lng: '--', accuracy: '--' });
        setPointCount(0);
        setTotalDistance('0 m');
        setTotalArea({ sqm: '0 m²', ha: '0 ha' });
        setExportEnabled(false);
        setSaveEnabled(false);
        setLogs([]);
        addLog('All data cleared.', 'info');
    }

    function clearAllSilent() {
        stopTracking();
        if (boundaryPolygonRef.current) { mapRef.current.removeLayer(boundaryPolygonRef.current); boundaryPolygonRef.current = null; }
        if (pathPolylineRef.current) { mapRef.current.removeLayer(pathPolylineRef.current); pathPolylineRef.current = null; }
        markersRef.current.forEach(m => mapRef.current.removeLayer(m));
        markersRef.current = [];
        boundaryPointsRef.current = [];
    }

    function exportBoundary() {
        const points = boundaryPointsRef.current;
        if (points.length === 0) {
            addLog('No boundary to export.', 'error');
            return;
        }

        const area = calculateArea(points);
        const exportData = {
            projectName: 'AgriRover Boundary',
            timestamp: new Date().toISOString(),
            pointCount: points.length,
            area: {
                squareMeters: area,
                hectares: area / 10000
            },
            boundary: points.map(p => ({
                lat: parseFloat(p.lat.toFixed(7)),
                lng: parseFloat(p.lng.toFixed(7))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agrirover-boundary-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addLog('Boundary exported as JSON file.', 'success');
    }

    async function handleSaveToDatabase() {
        const points = boundaryPointsRef.current;
        if (points.length < 3) {
            addLog('No boundary to save.', 'error');
            return;
        }

        setSaving(true);
        try {
            const area = calculateArea(points);
            const distance = updateDistance();

            await saveBoundary({
                projectName: 'AgriRover Boundary',
                points: points.map(p => ({
                    lat: parseFloat(p.lat.toFixed(7)),
                    lng: parseFloat(p.lng.toFixed(7))
                })),
                pointCount: points.length,
                areaSquareMeters: area,
                areaHectares: area / 10000,
                distanceMeters: distance
            });

            addLog('Boundary saved to database.', 'success');
        } catch (err) {
            addLog('Failed to save boundary: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    }

    function importBoundary(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                const points = data.boundary;

                if (!Array.isArray(points) || points.length < 3) {
                    addLog('Invalid file: need at least 3 boundary points.', 'error');
                    return;
                }

                clearAllSilent();

                boundaryPointsRef.current = points.map(p => ({ lat: p.lat, lng: p.lng }));
                boundaryPointsRef.current.forEach(p => addPointMarker(p));
                drawPath();

                setPointCount(boundaryPointsRef.current.length);
                updateDistance();

                finishBoundary();

                const area = data.area ? data.area.squareMeters : calculateArea(boundaryPointsRef.current);
                addLog(`Imported boundary: ${points.length} points, ${formatArea(area)}`, 'success');
                if (data.timestamp) {
                    addLog(`Original timestamp: ${data.timestamp}`, 'info');
                }
            } catch (err) {
                addLog('Failed to parse JSON file: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // ===== Panel touch drag =====
    useEffect(() => {
        const panel = document.getElementById('controlPanel');
        const handle = panel?.querySelector('.panel-handle');
        if (!handle) return;

        let startY = 0;
        let startHeight = 0;

        function onTouchStart(e) {
            startY = e.touches[0].clientY;
            startHeight = panel.offsetHeight;
            panel.style.transition = 'none';
        }

        function onTouchMove(e) {
            const containerHeight = panel.parentElement.getBoundingClientRect().height;
            const deltaY = startY - e.touches[0].clientY;
            const newHeight = Math.max(60, Math.min(startHeight + deltaY, containerHeight * 0.85));
            panel.style.maxHeight = newHeight + 'px';
        }

        function onTouchEnd() {
            panel.style.transition = '';
            const containerHeight = panel.parentElement.getBoundingClientRect().height;
            const currentHeight = panel.offsetHeight;
            const threshold = containerHeight * 0.35;

            if (currentHeight > threshold) {
                setPanelExpanded(true);
            } else {
                setPanelExpanded(false);
            }

            setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 380);
        }

        handle.addEventListener('touchstart', onTouchStart, { passive: true });
        handle.addEventListener('touchmove', onTouchMove, { passive: true });
        handle.addEventListener('touchend', onTouchEnd, { passive: true });

        return () => {
            handle.removeEventListener('touchstart', onTouchStart);
            handle.removeEventListener('touchmove', onTouchMove);
            handle.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    // ===== Resizable divider (desktop) =====
    useEffect(() => {
        const handle = document.getElementById('resizeHandle');
        if (!handle) return;

        const panel = document.getElementById('controlPanel');
        const minPanel = 280;
        const maxPanel = 600;
        let isResizing = false;

        function onPointerDown(e) {
            e.preventDefault();
            isResizing = true;
            handle.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            if (!isResizing) return;
            // Measured against the page's own container (not window.innerWidth) so
            // resizing works correctly when embedded next to the dashboard sidebar.
            const containerRect = panel.parentElement.getBoundingClientRect();
            const panelWidth = containerRect.right - e.clientX;
            const clamped = Math.max(minPanel, Math.min(maxPanel, panelWidth));

            document.documentElement.style.setProperty('--panel-width', clamped + 'px');
            panel.style.width = clamped + 'px';

            if (mapRef.current) {
                setTimeout(() => mapRef.current.invalidateSize(), 10);
            }
        }

        function onPointerUp() {
            isResizing = false;
            handle.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            if (mapRef.current) {
                setTimeout(() => mapRef.current.invalidateSize(), 50);
            }
        }

        handle.addEventListener('pointerdown', onPointerDown);
        return () => handle.removeEventListener('pointerdown', onPointerDown);
    }, []);

    return (
        <div className="map-tracking-page">
            <div className="map-section">
                <div id="map" ref={mapContainerRef}></div>

                <div className="map-buttons">
                    <button id="centerBtn" className={`center-btn${followMode ? ' locate-on' : ''}`} onClick={centerOnMe} title="Center on my location">
                        📍
                    </button>
                    <button id="layerBtn" className={`layer-btn${isSatellite ? ' active-satellite' : ''}`} onClick={toggleMapLayer} title="Toggle satellite/street map">
                        🛰️
                    </button>
                </div>

                <div id="resizeHandle" className="resize-handle"></div>
            </div>

            <div id="controlPanel" className={`control-panel${panelExpanded ? ' expanded' : ''}`}>
                <div className="panel-handle" onClick={togglePanel}>
                    <div className="handle-bar"></div>
                </div>

                <div className="quick-stats">
                    <div className="quick-stat">
                        <span className="quick-label">Status</span>
                        <span className={`quick-value ${tracking ? 'gps-on' : 'gps-off'}`}>{tracking ? 'ON' : 'OFF'}</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-label">Lat</span>
                        <span className="quick-value">{coords.lat === '--' ? '--' : parseFloat(coords.lat).toFixed(4)}</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-label">Lng</span>
                        <span className="quick-value">{coords.lng === '--' ? '--' : parseFloat(coords.lng).toFixed(4)}</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-label">Area</span>
                        <span className="quick-value highlight">{totalArea.sqm}</span>
                    </div>
                </div>

                <div className="panel-content">
                    <div className="info-card">
                        <h2>📍 Current Position</h2>
                        <div className="coord-grid">
                            <div className="coord-cell">
                                <span className="coord-label">Latitude</span>
                                <span className="coord-value">{coords.lat}</span>
                            </div>
                            <div className="coord-cell">
                                <span className="coord-label">Longitude</span>
                                <span className="coord-value">{coords.lng}</span>
                            </div>
                            <div className="coord-cell">
                                <span className="coord-label">Accuracy</span>
                                <span className="coord-value">{coords.accuracy}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <h2>📐 Boundary Stats</h2>
                        <div className="stat-grid">
                            <div className="stat-cell">
                                <span className="stat-value">{pointCount}</span>
                                <span className="stat-label">Points</span>
                            </div>
                            <div className="stat-cell">
                                <span className="stat-value">{totalDistance}</span>
                                <span className="stat-label">Distance</span>
                            </div>
                            <div className="stat-cell highlight">
                                <span className="stat-value">
                                    {totalArea.sqm.split(' ')[0]}
                                    <span className="stat-unit"> {totalArea.sqm.split(' ').slice(1).join(' ')}</span>
                                </span>
                                <span className="stat-label">Area</span>
                            </div>
                            <div className="stat-cell">
                                <span className="stat-value">{totalArea.ha}</span>
                                <span className="stat-label">Hectares</span>
                            </div>
                        </div>
                    </div>

                    <div className="button-grid">
                        <button className={`btn btn-start${tracking ? ' active' : ''}`} onClick={toggleTracking}>
                            {tracking ? '■ Stop' : '▶ Start'}
                        </button>
                        <button className="btn btn-finish" onClick={finishBoundary} disabled={pointCount < 3}>
                            ✓ Finish
                        </button>
                        <button className="btn btn-import" onClick={() => document.getElementById('importFile').click()}>
                            ⇧ Import
                        </button>
                        <button className="btn btn-export" onClick={exportBoundary} disabled={!exportEnabled}>
                            ⇩ Export
                        </button>
                        <button className="btn btn-save" onClick={handleSaveToDatabase} disabled={!saveEnabled || saving}>
                            {saving ? '⏳ Saving...' : '▣ Save'}
                        </button>
                        <button className="btn btn-clear" onClick={clearAll}>
                            ✕ Clear
                        </button>
                    </div>
                    <input type="file" id="importFile" accept=".json" style={{ display: 'none' }} onChange={importBoundary} />

                    <details className="info-card log-card" open>
                        <summary>📋 Log</summary>
                        <div className="log-container" ref={logContainerRef}>
                            {logs.map((l, i) => (
                                <div key={i} className={`log-entry ${l.type}`}>{l.msg}</div>
                            ))}
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}

export default MapTracking;
