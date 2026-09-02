import Card from '../components/Card';
import StatTile from '../components/StatTile';
import StatusPill from '../components/StatusPill';
import { cropIssues } from '../data/simulation';

function CropHealth() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile label="Overall Health" value="87" unit="%" tone="good" />
                <StatTile label="Disease Risk" value="Low" tone="good" caption="Stable" />
                <StatTile label="Pest Risk" value="Medium" tone="warn" caption="Monitoring required" />
                <StatTile label="Water Stress" value="Medium" tone="warn" caption="Schedule irrigation" />
            </div>

            <Card title="Detected Issues" icon="report">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] font-bold uppercase text-on-surface-variant border-b border-outline-variant/40">
                                <th className="py-2 pr-3">Issue</th>
                                <th className="py-2 pr-3">Zone</th>
                                <th className="py-2 pr-3">Confidence</th>
                                <th className="py-2 pr-3">Severity</th>
                                <th className="py-2 pr-3">Detected</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cropIssues.map((row) => (
                                <tr key={row.issue} className="border-b border-outline-variant/20 last:border-0">
                                    <td className="py-3 pr-3 font-medium text-on-surface">{row.issue}</td>
                                    <td className="py-3 pr-3 text-on-surface-variant">{row.zone}</td>
                                    <td className="py-3 pr-3 font-mono-data text-on-surface-variant">{row.confidence}%</td>
                                    <td className="py-3 pr-3"><StatusPill label={row.severity === 'bad' ? 'High' : 'Medium'} tone={row.severity} /></td>
                                    <td className="py-3 pr-3 text-on-surface-variant">{row.detected}</td>
                                    <td className="py-3">
                                        <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold">{row.action}</button>
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

export default CropHealth;
