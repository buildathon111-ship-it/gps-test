// ===== AgriRover GPS Boundary Mapper =====
// Mobile-first prototype: GPS tracking → boundary mapping → area calculation

// ===== State =====
let map;
let tracking = false;
let watchId = null;
let boundaryPoints = [];        // Array of {lat, lng}
let pathPolyline = null;        // Line showing current path
let boundaryPolygon = null;     // Filled polygon when boundary is closed
let markers = [];               // Point markers on the map
let startPos = null;            // First point (for closing boundary)
let streetLayer, satelliteLayer;
let isSatellite = false;
let followMode = false;       // Auto-center on user position
let blueDotMarker = null;     // Blue dot marker on map
let lastPosition = null;      // Last known GPS position

// ===== Constants =====
const DEFAULT_ZOOM = 18;      // High zoom for field-level view
const TRACKING_ZOOM = 19;     // Even closer while tracking
const FALLBACK_LAT = 20;      // Fallback center (India) if no GPS
const FALLBACK_LNG = 78;

// ===== Panel State =====
let panelExpanded = window.innerWidth >= 900;

// ===== Initialize Map =====
function initMap() {
    map = L.map('map', {
        zoomControl: false,   // We'll position zoom control ourselves
        attributionControl: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        maxZoom: 25,           // Allow deep manual zoom on satellite image
        minZoom: 2,
        zoomAnimation: true
    }).setView([FALLBACK_LAT, FALLBACK_LNG], DEFAULT_ZOOM);

    // Add zoom control to bottom-left (away from panel on mobile)
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Street map layer (OpenStreetMap)
    streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Satellite layer (Esri World Imagery — free, no API key)
    // maxNativeZoom=18: Esri has real tiles up to zoom 18
    // maxZoom=25: beyond 18, Leaflet scales up the zoom-18 tiles
    // Result: zoom in forever on the same image, just gets pixelated
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 25,
        maxNativeZoom: 18,
        detectRetina: true
    });

    // Immediately try to zoom to current location
    if (navigator.geolocation) {
        addLog('Acquiring GPS fix...', 'info');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                lastPosition = { lat: latitude, lng: longitude };
                updateBlueDot(latitude, longitude);
                map.setView([latitude, longitude], DEFAULT_ZOOM, {
                    animate: true,
                    duration: 0.5
                });
                addLog('GPS fix acquired. Map centered on your location.', 'success');
            },
            () => {
                addLog('GPS unavailable. Showing default location. Tap "Start" to begin.', 'error');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // Initialize touch drag for bottom sheet
    initPanelTouch();

    // Initialize resizable divider
    initResizeHandle();

    addLog('Map initialized.', 'info');
}

// ===== Toggle Satellite / Street Map Layer =====
function toggleMapLayer() {
    const btn = document.getElementById('layerBtn');
    if (isSatellite) {
        map.removeLayer(satelliteLayer);
        streetLayer.addTo(map);
        btn.classList.remove('active-satellite');
        isSatellite = false;
        addLog('Switched to Street view.', 'info');
    } else {
        map.removeLayer(streetLayer);
        satelliteLayer.addTo(map);
        btn.classList.add('active-satellite');
        isSatellite = true;
        addLog('Switched to Satellite view.', 'info');
    }
}

// ===== Position Marker (Black Dot) =====
function createPositionIcon() {
    return L.divIcon({
        className: 'position-marker',
        html: `
            <div class="position-pulse"></div>
            <div class="position-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}

function updateBlueDot(lat, lng) {
    if (!blueDotMarker) {
        blueDotMarker = L.marker([lat, lng], {
            icon: createPositionIcon(),
            interactive: false,
            zIndexOffset: 1000
        }).addTo(map);
    } else {
        blueDotMarker.setLatLng([lat, lng]);
    }
}

function removeBlueDot() {
    if (blueDotMarker) {
        map.removeLayer(blueDotMarker);
        blueDotMarker = null;
    }
}

// ===== Import Boundary from JSON =====
function importBoundary(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const points = data.boundary;

            if (!Array.isArray(points) || points.length < 3) {
                addLog('Invalid file: need at least 3 boundary points.', 'error');
                return;
            }

            // Clear any existing boundary first
            clearAllSilent();

            // Load the imported points
            boundaryPoints = points.map(p => ({ lat: p.lat, lng: p.lng }));

            // Add markers and draw
            boundaryPoints.forEach(p => addPointMarker(p));
            drawPath();

            // Update all UI
            document.getElementById('pointCount').textContent = boundaryPoints.length;
            document.getElementById('ptsQuick').textContent = boundaryPoints.length;
            updateDistance();

            // Auto-close into polygon
            finishBoundary();

            const area = data.area ? data.area.squareMeters : calculateArea(boundaryPoints);
            addLog(`Imported boundary: ${points.length} points, ${formatArea(area)}`, 'success');
            if (data.timestamp) {
                addLog(`Original timestamp: ${data.timestamp}`, 'info');
            }
        } catch (err) {
            addLog('Failed to parse JSON file: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported
    event.target.value = '';
}

// ===== Silent Clear (no log spam, used by import) =====
function clearAllSilent() {
    stopTracking();
    if (boundaryPolygon) { map.removeLayer(boundaryPolygon); boundaryPolygon = null; }
    if (pathPolyline) { map.removeLayer(pathPolyline); pathPolyline = null; }
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    boundaryPoints = [];
    startPos = null;
}

// ===== Bottom Sheet Toggle =====
function togglePanel() {
    const panel = document.getElementById('controlPanel');
    panelExpanded = !panelExpanded;
    panel.classList.toggle('expanded', panelExpanded);

    // Fix Leaflet map size after animation
    setTimeout(() => {
        map.invalidateSize();
    }, 380);
}

// ===== Locate Me (Google Maps style toggle) =====
let locateDebounce = false;

function centerOnMe() {
    // Prevent rapid taps
    if (locateDebounce) return;
    locateDebounce = true;
    setTimeout(() => { locateDebounce = false; }, 1000);

    const btn = document.getElementById('centerBtn');

    // Toggle follow mode on/off
    followMode = !followMode;

    if (followMode) {
        btn.classList.add('locate-on');

        if (!navigator.geolocation) {
            addLog('GPS not available on this device.', 'info');
            followMode = false;
            btn.classList.remove('locate-on');
            return;
        }

        addLog('Follow mode ON — tracking your position.', 'info');

        // Try to get current position
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                lastPosition = { lat: latitude, lng: longitude };
                updateBlueDot(latitude, longitude);
                map.setView([latitude, longitude], TRACKING_ZOOM, {
                    animate: true,
                    duration: 0.5
                });
            },
            (err) => {
                // Don't spam log — only tell user once
                if (err.code === 1) {
                    addLog('GPS permission denied. Allow location access in browser settings.', 'error');
                } else {
                    addLog('GPS signal unavailable. Follow mode is on — it will activate when signal is found.', 'info');
                }
                // Keep follow mode ON so it works when signal returns
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
        );
    } else {
        btn.classList.remove('locate-on');
        removeBlueDot();
        addLog('Follow mode OFF.', 'info');
    }
}

// ===== Panel Touch Drag =====
function initPanelTouch() {
    const panel = document.getElementById('controlPanel');
    const handle = panel.querySelector('.panel-handle');
    let startY = 0;
    let startHeight = 0;

    handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startHeight = panel.offsetHeight;
        panel.style.transition = 'none';
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
        const deltaY = startY - e.touches[0].clientY;
        const newHeight = Math.max(60, Math.min(startHeight + deltaY, window.innerHeight * 0.85));
        panel.style.maxHeight = newHeight + 'px';
    }, { passive: true });

    handle.addEventListener('touchend', (e) => {
        panel.style.transition = '';
        const currentHeight = panel.offsetHeight;
        const threshold = window.innerHeight * 0.35;

        if (currentHeight > threshold) {
            // Snap open
            panel.classList.add('expanded');
            panelExpanded = true;
        } else {
            // Snap closed
            panel.classList.remove('expanded');
            panelExpanded = false;
        }

        // Fix map size after snap animation
        setTimeout(() => map.invalidateSize(), 380);
    }, { passive: true });
}

// ===== Toggle Tracking =====
function toggleTracking() {
    if (tracking) {
        stopTracking();
    } else {
        startTracking();
    }
}

// ===== Start GPS Tracking =====
function startTracking() {
    if (!navigator.geolocation) {
        addLog('Geolocation is not supported by your browser.', 'error');
        return;
    }

    tracking = true;
    updateUI(true);
    addLog('GPS tracking started...', 'info');

    // Auto-expand panel on mobile to show stats
    if (!panelExpanded) {
        togglePanel();
    }

    // Watch position with high accuracy
    watchId = navigator.geolocation.watchPosition(
        onPositionReceived,
        onPositionError,
        {
            enableHighAccuracy: true,
            maximumAge: 1000,       // Accept positions up to 1s old
            timeout: 10000          // Timeout after 10s
        }
    );
}

// ===== Stop GPS Tracking (without closing boundary) =====
function stopTracking() {
    tracking = false;
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    updateUI(false);
    addLog('GPS tracking paused.', 'info');
}

// ===== Handle Position Update =====
function onPositionReceived(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const point = { lat: latitude, lng: longitude };

    // Update all coordinate displays
    const latText = latitude.toFixed(6);
    const lngText = longitude.toFixed(6);
    const accText = `±${accuracy.toFixed(1)} m`;

    document.getElementById('latDisplay').textContent = latText;
    document.getElementById('lngDisplay').textContent = lngText;
    document.getElementById('accuracyDisplay').textContent = accText;

    // Update quick stats (collapsed panel view)
    document.getElementById('latQuick').textContent = latitude.toFixed(4);
    document.getElementById('lngQuick').textContent = longitude.toFixed(4);

    // Store position for follow mode
    lastPosition = point;

    // Update blue dot if follow mode is on
    if (followMode) {
        updateBlueDot(latitude, longitude);
    }

    // Smooth zoom & center on current position (always during tracking)
    map.setView([latitude, longitude], TRACKING_ZOOM, {
        animate: true,
        duration: 0.3
    });

    // Add point to boundary
    boundaryPoints.push(point);
    document.getElementById('pointCount').textContent = boundaryPoints.length;
    document.getElementById('ptsQuick').textContent = boundaryPoints.length;

    // Add marker for this point
    addPointMarker(point);

    // Draw/update the path polyline
    drawPath();

    // Calculate total distance walked
    updateDistance();

    addLog(`Point #${boundaryPoints.length}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, 'success');
}

// ===== Handle Position Error =====
function onPositionError(error) {
    const messages = {
        1: 'Permission denied. Please allow GPS access.',
        2: 'Position unavailable. Check your GPS signal.',
        3: 'GPS timeout. Trying again...'
    };
    addLog(messages[error.code] || 'Unknown GPS error.', 'error');
}

// ===== Add Marker at Point =====
function addPointMarker(point) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-dot"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);
    markers.push(marker);

    // Store start position when first point is added
    if (boundaryPoints.length === 1) {
        startPos = point;
        addLog(`Boundary start: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`, 'info');
    }
}

// ===== Draw Path Polyline =====
function drawPath() {
    if (pathPolyline) {
        map.removeLayer(pathPolyline);
    }

    const latLngs = boundaryPoints.map(p => [p.lat, p.lng]);
    if (latLngs.length < 2) return;

    pathPolyline = L.polyline(latLngs, {
        color: '#4ade80',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 6'
    }).addTo(map);
}

// ===== Calculate Total Distance =====
function updateDistance() {
    let totalDist = 0;
    for (let i = 1; i < boundaryPoints.length; i++) {
        totalDist += haversineDistance(boundaryPoints[i - 1], boundaryPoints[i]);
    }
    document.getElementById('totalDistance').textContent = formatDistance(totalDist);
}

// ===== Haversine Distance (meters) =====
function haversineDistance(p1, p2) {
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ===== Convert degrees to radians =====
function toRad(deg) {
    return deg * Math.PI / 180;
}

// ===== Format distance for display =====
function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(1)} m`;
}

// ===== Finish Boundary (Close the polygon) =====
function finishBoundary() {
    if (boundaryPoints.length < 3) {
        addLog('Need at least 3 points to close a boundary.', 'error');
        return;
    }

    // Stop tracking
    stopTracking();

    // Close the path into a polygon
    const latLngs = boundaryPoints.map(p => [p.lat, p.lng]);

    if (boundaryPolygon) {
        map.removeLayer(boundaryPolygon);
    }

    boundaryPolygon = L.polygon(latLngs, {
        color: '#4ade80',
        weight: 2,
        fillColor: '#4ade80',
        fillOpacity: 0.15,
        dashArray: null
    }).addTo(map);

    // Remove the dashed polyline, replace with solid boundary
    if (pathPolyline) {
        map.removeLayer(pathPolyline);
        pathPolyline = null;
    }

    // Draw a solid closing line
    pathPolyline = L.polyline(latLngs, {
        color: '#4ade80',
        weight: 3,
        opacity: 0.9
    }).addTo(map);

    // Calculate and display area
    const area = calculateArea(boundaryPoints);
    document.getElementById('totalArea').textContent = formatArea(area);
    document.getElementById('totalAreaHa').textContent = formatHectares(area);
    document.getElementById('areaQuick').textContent = formatArea(area);

    // Fit map to boundary (with padding for panel on right/bottom)
    const isMobile = window.innerWidth < 600;
    const padding = isMobile
        ? [20, 20, 220, 20]    // top, right, bottom (above panel), left
        : [50, 50, 50, 400];   // top, right, bottom, left (side panel)
    map.fitBounds(boundaryPolygon.getBounds(), { padding });

    // Enable export button
    document.getElementById('exportBtn').disabled = false;

    addLog(`Boundary closed! Area: ${formatArea(area)} (${formatHectares(area)})`, 'success');
    addLog(`Total points: ${boundaryPoints.length}`, 'info');

    return area;
}

// ===== Calculate Polygon Area (Shoelace formula on projected coords) =====
function calculateArea(points) {
    if (points.length < 3) return 0;

    // Convert to Cartesian using equirectangular projection
    const latAvg = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const latRad = toRad(latAvg);
    const R = 6371000;

    const coords = points.map(p => ({
        x: toRad(p.lng) * R * Math.cos(latRad),
        y: toRad(p.lat) * R
    }));

    // Shoelace formula
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i].x * coords[j].y;
        area -= coords[j].x * coords[i].y;
    }

    return Math.abs(area / 2);
}

// ===== Format area for display =====
function formatArea(sqm) {
    if (sqm >= 10000) {
        return `${(sqm / 10000).toFixed(2)} ha`;
    }
    return `${sqm.toFixed(1)} m²`;
}

function formatHectares(sqm) {
    return `${(sqm / 10000).toFixed(4)} ha`;
}

// ===== Clear All =====
function clearAll() {
    // Stop tracking
    stopTracking();

    // Stop follow mode
    followMode = false;
    const locateBtn = document.getElementById('centerBtn');
    if (locateBtn) locateBtn.classList.remove('locate-on');
    removeBlueDot();

    // Remove polygon
    if (boundaryPolygon) {
        map.removeLayer(boundaryPolygon);
        boundaryPolygon = null;
    }

    // Remove polyline
    if (pathPolyline) {
        map.removeLayer(pathPolyline);
        pathPolyline = null;
    }

    // Remove all markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Reset state
    boundaryPoints = [];
    startPos = null;

    // Reset UI
    document.getElementById('latDisplay').textContent = '--';
    document.getElementById('lngDisplay').textContent = '--';
    document.getElementById('accuracyDisplay').textContent = '--';
    document.getElementById('latQuick').textContent = '--';
    document.getElementById('lngQuick').textContent = '--';
    document.getElementById('areaQuick').textContent = '--';
    document.getElementById('ptsQuick').textContent = '0';
    document.getElementById('pointCount').textContent = '0';
    document.getElementById('totalDistance').textContent = '0 m';
    document.getElementById('totalArea').textContent = '0 m²';
    document.getElementById('totalAreaHa').textContent = '0 ha';
    document.getElementById('exportBtn').disabled = true;

    // Clear log
    document.getElementById('logContainer').innerHTML = '';
    addLog('All data cleared.', 'info');
}

// ===== Export Boundary =====
function exportBoundary() {
    if (boundaryPoints.length === 0) {
        addLog('No boundary to export.', 'error');
        return;
    }

    const area = calculateArea(boundaryPoints);
    const exportData = {
        projectName: 'AgriRover Boundary',
        timestamp: new Date().toISOString(),
        pointCount: boundaryPoints.length,
        area: {
            squareMeters: area,
            hectares: area / 10000
        },
        boundary: boundaryPoints.map(p => ({
            lat: parseFloat(p.lat.toFixed(7)),
            lng: parseFloat(p.lng.toFixed(7))
        }))
    };

    // Download as JSON file
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

// ===== Update UI State =====
function updateUI(isTracking) {
    const startBtn = document.getElementById('startBtn');
    const finishBtn = document.getElementById('finishBtn');
    const statusBadge = document.getElementById('connectionStatus');
    const gpsQuick = document.getElementById('gpsStatusQuick');

    if (isTracking) {
        startBtn.textContent = '■ Stop';
        startBtn.classList.add('active');
        finishBtn.disabled = false;
        statusBadge.textContent = 'GPS ON';
        statusBadge.className = 'status-badge status-on';
        if (gpsQuick) {
            gpsQuick.textContent = 'ON';
            gpsQuick.className = 'quick-value gps-on';
        }
    } else {
        startBtn.textContent = '▶ Start';
        startBtn.classList.remove('active');
        finishBtn.disabled = true;
        statusBadge.textContent = 'GPS OFF';
        statusBadge.className = 'status-badge status-off';
        if (gpsQuick) {
            gpsQuick.textContent = 'OFF';
            gpsQuick.className = 'quick-value gps-off';
        }
    }
}

// ===== Logging =====
function addLog(message, type = '') {
    const container = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.textContent = `[${time}] ${message}`;

    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;

    // Keep only last 50 entries
    while (container.children.length > 50) {
        container.removeChild(container.firstChild);
    }
}

// ===== Resizable Panel Divider =====
let isResizing = false;

function initResizeHandle() {
    const handle = document.getElementById('resizeHandle');
    if (!handle) return;

    const panel = document.getElementById('controlPanel');
    const minPanel = 280;
    const maxPanel = 600;

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
        const x = e.clientX;
        const panelWidth = window.innerWidth - x;
        const clamped = Math.max(minPanel, Math.min(maxPanel, panelWidth));

        // Update CSS variable for all dependent elements
        document.documentElement.style.setProperty('--panel-width', clamped + 'px');

        // Also set panel width directly for non-CSS-var targets
        panel.style.width = clamped + 'px';

        // Reposition map buttons
        const mapBtns = document.querySelector('.map-buttons');
        if (mapBtns) {
            mapBtns.style.right = (clamped + 12) + 'px';
        }

        // Fix Leaflet map size
        if (map) {
            setTimeout(() => map.invalidateSize(), 10);
        }
    }

    function onPointerUp() {
        isResizing = false;
        handle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        // Final map invalidate after transition
        if (map) {
            setTimeout(() => map.invalidateSize(), 50);
        }
    }

    handle.addEventListener('pointerdown', onPointerDown);
}

// ===== Handle orientation / resize changes =====
window.addEventListener('resize', () => {
    if (map) {
        setTimeout(() => map.invalidateSize(), 100);
    }
});

// ===== Start App =====
document.addEventListener('DOMContentLoaded', initMap);
