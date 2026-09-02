// Hardware-aware domain model: domain events.
// Lets telemetry/commands feed the future risk engine, alert engine
// and Digital Twin without those modules coupling directly to every
// sensor/command source (Section 21).

export const EventType = Object.freeze({
    ROVER_CONNECTED: 'ROVER_CONNECTED',
    ROVER_DISCONNECTED: 'ROVER_DISCONNECTED',
    GPS_FIX_ACQUIRED: 'GPS_FIX_ACQUIRED',
    GPS_FIX_LOST: 'GPS_FIX_LOST',
    OBSTACLE_DETECTED: 'OBSTACLE_DETECTED',
    LOW_BATTERY: 'LOW_BATTERY',
    SOIL_MOISTURE_LOW: 'SOIL_MOISTURE_LOW',
    RAIN_DETECTED: 'RAIN_DETECTED',
    TEMPERATURE_HIGH: 'TEMPERATURE_HIGH',
    PLANT_DETECTED: 'PLANT_DETECTED',
    IRRIGATION_STARTED: 'IRRIGATION_STARTED',
    IRRIGATION_COMPLETED: 'IRRIGATION_COMPLETED',
    RISK_INCREASED: 'RISK_INCREASED',
    FIELD_SCAN_COMPLETED: 'FIELD_SCAN_COMPLETED'
});

/**
 * @typedef {Object} DomainEvent
 * @property {string} eventId
 * @property {keyof typeof EventType} type
 * @property {string} timestamp ISO 8601
 * @property {string} [deviceId]
 * @property {string} [zoneId]
 * @property {Object} [payload]
 */

/**
 * @param {Partial<DomainEvent> & { eventId: string, type: string }} input
 * @returns {DomainEvent}
 */
export function createEvent(input) {
    if (!input.eventId) throw new Error('eventId is required');
    if (!Object.values(EventType).includes(input.type)) {
        throw new Error(`Unknown event type: ${input.type}`);
    }

    return {
        eventId: input.eventId,
        type: input.type,
        timestamp: input.timestamp ?? new Date().toISOString(),
        deviceId: input.deviceId ?? null,
        zoneId: input.zoneId ?? null,
        payload: input.payload ?? {}
    };
}
