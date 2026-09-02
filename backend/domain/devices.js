// Hardware-aware domain model: devices.
// Pure vocabulary shared by later phases (device registry, ingestion,
// realtime, UI). No Mongoose/Express dependency on purpose.

/** Physical node roles that make up one AGRIVISION rover. */
export const DeviceType = Object.freeze({
    CONTROLLER_NODE: 'CONTROLLER_NODE', // ESP32 Node 1: joystick/operator input, mode switching
    MOTOR_NODE: 'MOTOR_NODE',           // ESP32 Node 2: motor drivers, ultrasonic obstacle sensors
    SENSOR_NODE: 'SENSOR_NODE',         // ESP32 Node 3: GPS, DHT22, soil, rain, LDR, INA219
    CAMERA_NODE: 'CAMERA_NODE',         // ESP32-CAM
    ROVER: 'ROVER'                      // Composite: the rover as a whole, references its nodes
});

/** Connectivity/health state of a device or node. */
export const ConnectionStatus = Object.freeze({
    ONLINE: 'ONLINE',
    DEGRADED: 'DEGRADED',
    OFFLINE: 'OFFLINE',
    UNKNOWN: 'UNKNOWN'
});

/** GPS fix quality — never assume coordinates are valid just because a message arrived. */
export const GpsFixStatus = Object.freeze({
    FIXED: 'FIXED',
    SEARCHING: 'SEARCHING',
    LOST: 'LOST'
});

/**
 * @typedef {Object} DeviceRecord
 * @property {string} deviceId
 * @property {keyof typeof DeviceType} type
 * @property {string} [firmwareVersion]
 * @property {string} [lastSeen] ISO timestamp of last received telemetry/heartbeat
 * @property {keyof typeof ConnectionStatus} status
 * @property {{voltage?: number, estimatedPercent?: number}} [battery]
 * @property {string[]} [capabilities] e.g. ['gps', 'soilMoisture', 'ultrasonic']
 */

/**
 * Build a DeviceRecord with sane defaults. Does not persist anything —
 * Phase 2 (device registry) is responsible for storage.
 * @param {Partial<DeviceRecord> & { deviceId: string, type: string }} input
 * @returns {DeviceRecord}
 */
export function createDeviceRecord(input) {
    if (!input.deviceId) throw new Error('deviceId is required');
    if (!Object.values(DeviceType).includes(input.type)) {
        throw new Error(`Unknown device type: ${input.type}`);
    }

    return {
        deviceId: input.deviceId,
        type: input.type,
        firmwareVersion: input.firmwareVersion ?? null,
        lastSeen: input.lastSeen ?? null,
        status: input.status ?? ConnectionStatus.UNKNOWN,
        battery: input.battery ?? null,
        capabilities: input.capabilities ?? []
    };
}
