import Card from '../components/Card';
import { alerts } from '../data/simulation';

const BORDER = { bad: 'border-l-error', warn: 'border-l-warning', info: 'border-l-outline' };
const ICON_BG = { bad: 'bg-error-container text-on-error-container', warn: 'bg-warning-container text-on-warning-container', info: 'bg-surface-container-high text-on-surface-variant' };
const LABEL = { bad: 'Critical', warn: 'Warning', info: 'Info' };
const LABEL_COLOR = { bad: 'text-error', warn: 'text-warning', info: 'text-on-surface-variant' };

function Alerts() {
    return (
        <div className="flex flex-col gap-3">
            {alerts.map((a) => (
                <Card key={a.id} className={`border-l-4 ${BORDER[a.severity]}`}>
                    <div className="flex items-start gap-4">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_BG[a.severity]}`}>
                            <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1">
                                <span className={LABEL_COLOR[a.severity]}>{LABEL[a.severity]}</span>
                                <span className="text-on-surface-variant font-normal normal-case">{a.time}</span>
                            </div>
                            <p className="text-sm font-semibold text-on-surface">{a.title}</p>
                            <p className="text-sm text-on-surface-variant mt-0.5">{a.body}</p>
                            {(a.zone || a.meta) && (
                                <p className="text-xs text-on-surface-variant mt-1.5 flex gap-3">
                                    {a.zone && <span>📍 Zone {a.zone}</span>}
                                    {a.meta && <span>{a.meta}</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

export default Alerts;
