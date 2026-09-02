import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { irrigationZones, pump, irrigationHistory } from '../data/simulation';

function Irrigation() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="Zone Irrigation Control" icon="water_drop">
                    <div className="flex flex-col gap-2">
                        {irrigationZones.map((z) => (
                            <div key={z.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                                <div>
                                    <p className="text-sm font-semibold text-on-surface">Zone {z.id}</p>
                                    <p className="text-xs text-on-surface-variant">{z.moisture}% Moisture</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusPill label={z.label} tone={z.status} />
                                    <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        z.action === 'Stop' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
                                    }`}>
                                        {z.action}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Pump Status" icon="water_pump">
                    <div className="text-center py-2">
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Pump State</p>
                        <p className="font-headline text-4xl font-extrabold text-on-surface">{pump.state}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 my-4">
                        <div className="p-3 rounded-xl bg-surface-container text-center">
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Runtime Today</p>
                            <p className="font-mono-data text-lg text-on-surface">{pump.totalRuntimeToday}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container text-center">
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Last Activation</p>
                            <p className="font-mono-data text-lg text-on-surface">{pump.lastActivation}</p>
                        </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-error text-on-error font-bold">STOP PUMP</button>
                    <p className="text-[11px] text-on-surface-variant text-center mt-2">
                        Safety timeout: irrigation automatically shuts off after {pump.safetyTimeoutMinutes} mins to prevent over-watering.
                    </p>
                </Card>
            </div>

            <Card title="Irrigation History" icon="history">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] font-bold uppercase text-on-surface-variant border-b border-outline-variant/40">
                                <th className="py-2 pr-3">Zone</th>
                                <th className="py-2 pr-3">Start Time</th>
                                <th className="py-2 pr-3">Duration</th>
                                <th className="py-2 pr-3">Moisture Before</th>
                                <th className="py-2 pr-3">Moisture After</th>
                                <th className="py-2">Outcome</th>
                            </tr>
                        </thead>
                        <tbody>
                            {irrigationHistory.map((row, i) => (
                                <tr key={i} className="border-b border-outline-variant/20 last:border-0">
                                    <td className="py-3 pr-3 font-medium text-on-surface">Zone {row.zone}</td>
                                    <td className="py-3 pr-3 text-on-surface-variant">{row.start}</td>
                                    <td className="py-3 pr-3 text-on-surface-variant">{row.duration}</td>
                                    <td className="py-3 pr-3 font-mono-data text-on-surface-variant">{row.before}%</td>
                                    <td className="py-3 pr-3 font-mono-data text-on-surface-variant">{row.after}%</td>
                                    <td className={`py-3 font-medium ${row.outcome === 'Successful' ? 'text-secondary' : 'text-warning'}`}>
                                        {row.outcome} — {row.delta} moisture
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

export default Irrigation;
