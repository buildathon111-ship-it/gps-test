import Card from '../components/Card';
import { environment } from '../data/simulation';

function Provenance({ source, nodeId, ts }) {
    return (
        <span className="text-[10px] opacity-60 mt-1 block">
            {source}{nodeId ? ` · ${nodeId}` : ''} · {ts}
        </span>
    );
}

function EnvTile({ label, tone = 'neutral', children, provenance }) {
    const bg = tone === 'primary' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface border border-outline-variant/40';
    return (
        <div className={`rounded-2xl p-4 flex flex-col gap-2 ${bg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
            {children}
            <Provenance {...provenance} />
        </div>
    );
}

function Environment() {
    const { airTemp, humidity, rain, wind, soilMoisture, light } = environment;

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <EnvTile label="Air Temp" provenance={airTemp}>
                    <span className="font-headline text-2xl font-bold">{airTemp.value}{airTemp.unit}</span>
                </EnvTile>
                <EnvTile label="Humidity" provenance={humidity}>
                    <span className="font-headline text-2xl font-bold">{humidity.value}{humidity.unit}</span>
                </EnvTile>
                <EnvTile label="Rain Detection" provenance={rain}>
                    <span className="font-headline text-xl font-bold">{rain.detected ? 'Detected' : 'Not Detected'}</span>
                    <span className="text-[10px] opacity-60">raw {rain.raw} · not a calibrated gauge</span>
                </EnvTile>
                <EnvTile label="Wind" provenance={wind}>
                    <span className="font-headline text-2xl font-bold">{wind.value} {wind.unit}</span>
                </EnvTile>
                <EnvTile label="Soil Moisture" tone="primary" provenance={soilMoisture}>
                    <span className="font-headline text-2xl font-bold">{soilMoisture.calibratedPercent}%</span>
                    <span className="text-[10px] opacity-70">raw {soilMoisture.raw} · {soilMoisture.calibrated ? 'calibrated' : 'uncalibrated'}</span>
                </EnvTile>
                <EnvTile label="Light" provenance={light}>
                    <span className="font-headline text-xl font-bold">{light.detected ? 'Daylight' : 'Dark'}</span>
                    <span className="text-[10px] opacity-60">raw {light.raw}</span>
                </EnvTile>
            </div>

            <Card title="Data Telemetry Sources" icon="hub">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
                        <span className="material-symbols-outlined text-on-surface-variant">precision_manufacturing</span>
                        <div>
                            <p className="text-sm font-semibold text-on-surface">Local Rover Sensors</p>
                            <p className="text-xs text-on-surface-variant">DHT22, soil moisture, rain, LDR — real-time ground truth</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-secondary ml-auto shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
                        <span className="material-symbols-outlined text-on-surface-variant">cloud</span>
                        <div>
                            <p className="text-sm font-semibold text-on-surface">Open-Meteo</p>
                            <p className="text-xs text-on-surface-variant">Aggregated forecast &amp; wind data</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-secondary ml-auto shrink-0" />
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Environment;
