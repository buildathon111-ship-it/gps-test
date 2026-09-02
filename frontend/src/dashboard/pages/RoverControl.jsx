import { useState } from 'react';
import Card from '../components/Card';
import { power, gps, obstacle, rover } from '../data/simulation';

const PROXIMITY_ROWS = [
    { key: 'front', label: 'Front', dot: 'bg-error' },
    { key: 'left', label: 'Left', dot: 'bg-warning' },
    { key: 'right', label: 'Right', dot: 'bg-secondary' },
    { key: 'rear', label: 'Rear', dot: 'bg-tertiary' },
];

// UI-only command dispatch — no transport wired up yet (Phase 10+).
// Mirrors backend/domain/commands.js's RoverCommand shape so the real
// dispatch can slot in later without changing this component's contract.
function dispatchCommand(type) {
    console.info('[RoverCommand]', { type, deviceId: rover.deviceId, source: 'ui', timestamp: new Date().toISOString() });
}

function RoverControl() {
    const [throttle, setThrottle] = useState(45);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-5">
            <div className="flex flex-col gap-5">
                <Card title="Telemetry" icon="speed">
                    <dl className="flex flex-col gap-2.5 text-sm">
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Measured Voltage</dt>
                            <dd className="font-mono-data text-on-surface">{power.voltage} V</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Est. Battery</dt>
                            <dd className="font-mono-data text-on-surface">≈{power.estimatedBatteryPercent}%</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Current</dt>
                            <dd className="font-mono-data text-on-surface">{power.current} A</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Power</dt>
                            <dd className="font-mono-data text-on-surface">{power.power} W</dd>
                        </div>
                    </dl>
                </Card>

                <Card title="Navigation" icon="near_me">
                    <dl className="flex flex-col gap-2.5 text-sm">
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">GPS Fix</dt>
                            <dd className="font-mono-data text-on-surface">{gps.fix} · {gps.satellites} sats</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Coordinates</dt>
                            <dd className="font-mono-data text-on-surface text-xs">{gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Heading</dt>
                            <dd className="font-mono-data text-on-surface">{gps.heading}°</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase text-on-surface-variant">Speed</dt>
                            <dd className="font-mono-data text-on-surface">{gps.speed} m/s</dd>
                        </div>
                    </dl>
                </Card>
            </div>

            <div className="flex flex-col gap-5">
                <Card title="Live Feed" icon="videocam" className="flex-1 flex flex-col min-h-[220px]">
                    <div className="flex-1 rounded-xl bg-primary/95 flex items-center justify-center text-on-primary/60 text-xs">
                        Camera feed unavailable in simulation mode — see AI Vision page.
                    </div>
                </Card>

                <Card title="Manual Drive" icon="sports_esports">
                    <div className="flex items-center justify-center gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Throttle</span>
                            <input
                                type="range" min="0" max="100" value={throttle}
                                onChange={(e) => setThrottle(Number(e.target.value))}
                                className="w-24 accent-primary"
                            />
                            <span className="font-mono-data text-sm text-on-surface">{throttle}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div />
                            <button onClick={() => dispatchCommand('MOVE_FORWARD')} className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                                <span className="material-symbols-outlined">arrow_upward</span>
                            </button>
                            <div />
                            <button onClick={() => dispatchCommand('TURN_LEFT')} className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <button onClick={() => dispatchCommand('EMERGENCY_STOP')} className="w-11 h-11 rounded-full bg-error text-on-error flex items-center justify-center font-bold text-[10px]">
                                E-STOP
                            </button>
                            <button onClick={() => dispatchCommand('TURN_RIGHT')} className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <div />
                            <button onClick={() => dispatchCommand('MOVE_BACKWARD')} className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest">
                                <span className="material-symbols-outlined">arrow_downward</span>
                            </button>
                            <div />
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Proximity" icon="radar">
                <div className="flex flex-col gap-2">
                    {PROXIMITY_ROWS.map((row) => (
                        <div key={row.key} className="flex items-center justify-between bg-surface-container px-3 py-2 rounded-lg">
                            <span className="flex items-center gap-2 text-[11px] font-bold uppercase text-on-surface-variant">
                                <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                                {row.label}
                            </span>
                            <span className="font-mono-data text-sm text-on-surface">{obstacle[row.key]}m</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default RoverControl;
