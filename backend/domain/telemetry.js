// Hardware-aware domain model: normalized telemetry envelope.
// Every hardware node — and every simulation provider — must produce
// data shaped like this. Categories are optional so a partial packet
// from one node never requires fabricating the rest (Section 29:
// one broken sensor must never bring down AGRIROVER).

/**
 * @typedef {Object} GpsReading
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [altitude]
 * @property {number} [speed]
 * @property {number} [course]
 * @property {boolean} fix
 * @property {number} [satellites]
 * @property {number} [hdop]
 *
 * @typedef {Object} EnvironmentReading  // DHT22
 * @property {number} [temperature] Celsius
 * @property {number} [humidity] percent
 *
 * @typedef {Object} SoilReading
 * @property {number} raw
 * @property {number} [moisturePercent] only present once calibration exists
 * @property {boolean} calibrated
 *
 * @typedef {Object} RainReading  // basic rain-drop detector, NOT a calibrated gauge
 * @property {boolean} detected
 * @property {number} [raw]
 *
 * @typedef {Object} LightReading  // LDR, not a calibrated lux sensor
 * @property {boolean} [detected]
 * @property {number} [raw]
 *
 * @typedef {Object} ObstacleReading  // HC-SR04 x4
 * @property {number} [front] cm
 * @property {number} [left] cm
 * @property {number} [right] cm
 * @property {number} [rear] cm
 *
 * @typedef {Object} PowerReading  // INA219 — measured values only, no invented battery %
 * @property {number} [voltage]
 * @property {number} [current]
 * @property {number} [power]
 *
 * @typedef {Object} RoverState
 * @property {'MANUAL'|'ASSISTED'|'AUTONOMOUS'|'SIMULATION'} [mode]
 * @property {number} [speed]
 * @property {string} [batteryStatus]
 *
 * @typedef {Object} TelemetryEnvelope
 * @property {string} deviceId
 * @property {string} [nodeId]
 * @property {string} timestamp ISO 8601
 * @property {'simulation'|'serial'|'wifi'|'lora'|'esp-now'} transport
 * @property {number} [sequence]
 * @property {GpsReading} [gps]
 * @property {EnvironmentReading} [environment]
 * @property {SoilReading} [soil]
 * @property {RainReading} [rain]
 * @property {LightReading} [light]
 * @property {ObstacleReading} [obstacle]
 * @property {PowerReading} [power]
 * @property {RoverState} [rover]
 */

const VALID_TRANSPORTS = ['simulation', 'serial', 'wifi', 'lora', 'esp-now'];

/**
 * Structural validation only — this is the domain contract, not a
 * Mongoose schema. Throws a descriptive error on the first problem
 * found rather than silently dropping data (Section 3: never
 * silently discard).
 * @param {Partial<TelemetryEnvelope>} envelope
 * @returns {TelemetryEnvelope}
 */
export function validateTelemetryEnvelope(envelope) {
    if (!envelope || typeof envelope !== 'object') {
        throw new Error('Telemetry envelope must be an object');
    }
    if (!envelope.deviceId) throw new Error('Telemetry envelope requires deviceId');
    if (!envelope.timestamp) throw new Error('Telemetry envelope requires timestamp');
    if (!VALID_TRANSPORTS.includes(envelope.transport)) {
        throw new Error(`Unknown transport: ${envelope.transport}`);
    }

    if (envelope.gps) {
        const { latitude, longitude } = envelope.gps;
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            throw new Error('Invalid GPS latitude');
        }
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            throw new Error('Invalid GPS longitude');
        }
    }

    return envelope;
}
