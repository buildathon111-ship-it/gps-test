import Card from '../components/Card';
import StatTile from '../components/StatTile';
import { reports } from '../data/simulation';

const ICON_TONE = { good: 'bg-secondary-container text-on-secondary-container', bad: 'bg-error-container text-on-error-container', info: 'bg-tertiary-container text-on-tertiary-container', neutral: 'bg-surface-container-high text-on-surface-variant' };

function Reports() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile label="Field Area Analyzed" value="2.4" unit="ha" tone="neutral" />
                <StatTile label="Rover Scans Complete" value="1,402" tone="good" sub="+12% vs last wk" />
                <StatTile label="Issues Logged" value="18" tone="warn" caption="4 critical" />
                <StatTile label="Avg Field Health" value="92" unit="%" tone="good" />
            </div>

            <Card title="Document Generation" icon="description" action={
                <button className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    New Custom Report
                </button>
            }>
                <div className="flex flex-col gap-2">
                    {reports.map((r) => (
                        <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_TONE[r.tone]}`}>
                                <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-on-surface truncate">{r.name}</p>
                                <p className="text-xs text-on-surface-variant">{r.file} · {r.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default Reports;
