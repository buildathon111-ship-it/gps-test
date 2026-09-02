// Hardware-aware domain model: communication transport abstraction.
// Higher layers (ingestion, command service) must depend only on this
// shape — never on LoRa/WiFi/serial specifics directly (Section 7).
// No concrete transport is implemented in Phase 1; this defines the
// contract Phase 11 (LoRa) and Phase 5 (simulation) will implement.

export const TransportKind = Object.freeze({
    SIMULATION: 'simulation',
    SERIAL: 'serial',
    WIFI: 'wifi',
    LORA: 'lora',
    ESP_NOW: 'esp-now'
});

/**
 * @typedef {Object} CommunicationTransport
 * @property {() => Promise<void>} start
 * @property {() => Promise<void>} stop
 * @property {(deviceId: string, message: object) => Promise<void>} send
 * @property {(callback: (message: object) => void) => (() => void)} onMessage
 *   Registers a handler for inbound messages (telemetry, acks); returns
 *   an unsubscribe function.
 */

/**
 * Throws if an object doesn't structurally satisfy CommunicationTransport.
 * Used by future transport implementations to self-check, and by the
 * ingestion layer to fail fast on a misconfigured provider.
 * @param {Partial<CommunicationTransport>} transport
 */
export function assertIsCommunicationTransport(transport) {
    for (const method of ['start', 'stop', 'send', 'onMessage']) {
        if (typeof transport?.[method] !== 'function') {
            throw new Error(`CommunicationTransport is missing method: ${method}`);
        }
    }
}
