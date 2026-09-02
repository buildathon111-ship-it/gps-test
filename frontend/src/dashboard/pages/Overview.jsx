import { Link } from 'react-router-dom';
import Card from '../components/Card';
import StatTile from '../components/StatTile';
import { power, gps, environment, riskScores, zones, detections, roverLog } from '../data/simulation';

function Overview() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">Command Center</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Live simulated telemetry across the field.</p>
                </div>
                <Link to="/gps-mapping" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    Open GPS Mapping
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile label="Field Health" value="87" unit="/100" tone="good" sub="↑ 2%" />
                <StatTile label="Rover Battery" value={power.estimatedBatteryPercent} unit="% est." tone="neutral" caption={`Measured ${power.voltage}V`} />
                <StatTile label="Soil Moisture" value={environment.soilMoisture.calibratedPercent} unit="% vol" tone="good" caption="Optimal" />
                <StatTile label="Canopy Temp" value={environment.airTemp.value} unit="°C" tone="warn" caption="Moderate heat" />
                <StatTile label="Risk Index" value={riskScores.aggregate} unit="/100" tone="good" caption="Low risk" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
                <Card title="Sector A · Live Telemetry" icon="map" className="min-h-[320px] flex flex-col">
                    <div className="flex-1 rounded-xl bg-surface-container-high relative overflow-hidden flex items-center justify-center min-h-[260px]">
                        <div className="text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[40px] opacity-40">satellite_alt</span>
                            <p className="text-xs mt-2 max-w-[220px] mx-auto">
                                Zone overview map — see <Link to="/field-map" className="underline font-semibold">Field Map</Link> for the GIS view, or <Link to="/gps-mapping" className="underline font-semibold">GPS Mapping</Link> to record a live boundary.
                            </p>
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] font-mono-data bg-surface/90 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            GPS {gps.fix} · {gps.satellites} sats
                        </div>
                    </div>
                </Card>

                <Card tone="dark" title="AI Insight" icon="auto_awesome">
                    <p className="text-sm text-on-primary/90 leading-relaxed">
                        Water stress detected in <strong>Zone A2</strong>. Current soil moisture is below optimal range (26%). Rain probability low for next 72 hours.
                    </p>
                    <div className="mt-4 p-3 rounded-xl bg-on-primary/10">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-on-primary/70 mb-1">Recommendation</p>
                        <p className="text-sm text-on-primary/90">Inspect Zone A2 and consider targeted irrigation to mitigate yield loss.</p>
                    </div>
                    <Link to="/field-map" className="mt-3 block text-center py-2.5 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-semibold">
                        View Zone A2
                    </Link>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card title="Field Zones" icon="grid_view">
                    <div className="flex flex-col gap-2">
                        {zones.map((z) => (
                            <div key={z.id} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-on-surface">{z.name}</span>
                                <span className="text-on-surface-variant">{z.health}/100 · {z.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Recent Detections" icon="visibility">
                    <div className="flex flex-col gap-3">
                        {detections.map((d) => (
                            <div key={d.label} className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{d.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-on-surface truncate">{d.label}</p>
                                    <div className="h-1 bg-surface-container-high rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${d.confidence}%` }} />
                                    </div>
                                </div>
                                <span className="text-xs font-mono-data text-on-surface-variant">{d.confidence}%</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/alerts" className="mt-3 block text-xs font-semibold text-primary">View all alerts →</Link>
                </Card>

                <Card title="Rover Log" icon="agriculture">
                    <div className="flex flex-col gap-3">
                        {roverLog.map((l, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className={`material-symbols-outlined text-[16px] mt-0.5 ${l.tone === 'bad' ? 'text-error' : 'text-secondary'}`}>{l.icon}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-on-surface">{l.title} <span className="text-on-surface-variant font-normal">· {l.time}</span></p>
                                    <p className="text-xs text-on-surface-variant">{l.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Overview;
