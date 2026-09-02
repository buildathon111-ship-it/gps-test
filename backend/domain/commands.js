// Hardware-aware domain model: rover commands.
// AGRIROVER never speaks GPIO — it emits these commands, a future
// transport layer carries them to an ESP32, and firmware translates
// them into motor/pump signals.

export const CommandType = Object.freeze({
    MOVE_FORWARD: 'MOVE_FORWARD',
    MOVE_BACKWARD: 'MOVE_BACKWARD',
    TURN_LEFT: 'TURN_LEFT',
    TURN_RIGHT: 'TURN_RIGHT',
    STOP: 'STOP',
    SET_SPEED: 'SET_SPEED',
    SET_MOTOR_SPEED: 'SET_MOTOR_SPEED',
    EMERGENCY_STOP: 'EMERGENCY_STOP',
    START_PUMP: 'START_PUMP',
    STOP_PUMP: 'STOP_PUMP',
    IRRIGATE_ZONE: 'IRRIGATE_ZONE',
    START_SCAN: 'START_SCAN',
    RETURN_HOME: 'RETURN_HOME'
});

export const CommandStatus = Object.freeze({
    QUEUED: 'QUEUED',
    SENT: 'SENT',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    EXECUTED: 'EXECUTED',
    FAILED: 'FAILED',
    TIMEOUT: 'TIMEOUT'
});

export const MotorId = Object.freeze({
    FRONT_LEFT: 'frontLeft',
    FRONT_RIGHT: 'frontRight',
    REAR_LEFT: 'rearLeft',
    REAR_RIGHT: 'rearRight'
});

/**
 * @typedef {Object} RoverCommand
 * @property {string} commandId
 * @property {string} deviceId
 * @property {keyof typeof CommandType} type
 * @property {string} timestamp ISO 8601
 * @property {string} source e.g. 'ui', 'automation', 'irrigation-service'
 * @property {Object} [parameters]
 * @property {keyof typeof CommandStatus} status
 */

/**
 * @param {Partial<RoverCommand> & { commandId: string, deviceId: string, type: string, source: string }} input
 * @returns {RoverCommand}
 */
export function createCommand(input) {
    if (!input.commandId) throw new Error('commandId is required');
    if (!input.deviceId) throw new Error('deviceId is required');
    if (!Object.values(CommandType).includes(input.type)) {
        throw new Error(`Unknown command type: ${input.type}`);
    }
    if (!input.source) throw new Error('command source is required');

    return {
        commandId: input.commandId,
        deviceId: input.deviceId,
        type: input.type,
        timestamp: input.timestamp ?? new Date().toISOString(),
        source: input.source,
        parameters: input.parameters ?? {},
        status: input.status ?? CommandStatus.QUEUED
    };
}
