import { Link } from 'react-router-dom';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { zones } from '../data/simulation';

function FieldMap() {
    const selected = zones.find((z) => z.status === 'bad') ?? zones[0];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
            <Card title="Field Alpha · Sector 4" icon="map" className="min-h-[420px] flex flex-col">
                <div className="flex-1 rounded-xl bg-surface-container-high overflow-hidden relative min-h-[360px]">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
                        {zones.map((z) => (
                            <div
                                key={z.id}
                                className={`rounded-lg flex items-end p-3 text-white text-xs font-bold ${
                                    z.status === 'good' ? 'bg-secondary/70' : z.status === 'bad' ? 'bg-error/60' : 'bg-warning/60'
                                }`}
                            >
                                {z.name}: {z.health}%
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-3">
                    Real GPS boundary recording lives on the <Link to="/gps-mapping" className="underline font-semibold">GPS Mapping</Link> page. This is a simulated zone-health overlay.
                </p>
            </Card>

            <Card title="Selected Zone" icon="my_location" className={selected.status === 'bad' ? 'glow-pulse' : ''}>
                <div className="flex items-center justify-between mb-3">
                    <span className="font-headline text-lg font-bold text-on-surface">{selected.name}</span>
                    <StatusPill label={selected.label} tone={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Health</p>
                        <p className="font-mono-data text-lg text-on-surface">{selected.health}/100</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Moisture</p>
                        <p className="font-mono-data text-lg text-on-surface">{selected.moisture}%</p>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-primary text-on-primary text-sm mb-3">
                    <p className="text-[10px] font-bold uppercase text-on-primary/70 mb-1">AI Recommendation</p>
                    Stress detected. Inspect irrigation requirement and potential localized pathogen spread.
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold">Navigate Rover</button>
                    <Link to="/irrigation" className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-semibold text-center">Irrigate Zone</Link>
                </div>
            </Card>
        </div>
    );
}

export default FieldMap;
