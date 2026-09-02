import Card from '../components/Card';
import StatTile from '../components/StatTile';
import { riskScores } from '../data/simulation';

function RiskIntel() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
                <Card title="Aggregate Risk" icon="shield" className="flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full border-8 border-secondary-container flex items-center justify-center">
                        <div>
                            <p className="font-headline text-3xl font-extrabold text-on-surface">{riskScores.aggregate}</p>
                            <p className="text-[10px] text-on-surface-variant">/100</p>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold uppercase text-secondary mt-3">Low Risk Baseline</p>
                    <p className="text-xs text-on-surface-variant mt-1">Current factors pose minimal immediate threat to yield.</p>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <StatTile label="Heat Stress" value={riskScores.heatStress.value} tone="warn" caption={riskScores.heatStress.label} />
                    <StatTile label="Water Stress" value={riskScores.waterStress.value} tone="warn" caption={riskScores.waterStress.label} />
                    <StatTile label="Drought Risk" value={riskScores.droughtRisk.value} tone="good" caption={riskScores.droughtRisk.label} />
                    <StatTile label="Vegetation Stress" value={riskScores.vegStress.value} tone="good" caption={riskScores.vegStress.label} />
                </div>
            </div>

            <Card tone="dark" title="Explainable AI" icon="auto_awesome">
                <p className="font-headline text-lg font-bold text-on-primary mb-3">Why is heat stress elevated?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {riskScores.explain.map((f) => (
                        <div key={f.label} className="flex gap-3 p-3 rounded-xl bg-on-primary/10">
                            <span className="material-symbols-outlined text-[18px] text-on-primary/80 mt-0.5">{f.icon}</span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-on-primary">{f.label}</p>
                                <p className="text-xs text-on-primary/70">{f.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="text-xs text-on-surface-variant p-4 rounded-xl bg-surface-container border border-outline-variant/30">
                <strong>Disclaimer:</strong> This dashboard provides an AI-assisted decision-support estimate based on simulated telemetry. It is not an official agricultural warning or a substitute for professional agronomist consultation.
            </div>
        </div>
    );
}

export default RiskIntel;
