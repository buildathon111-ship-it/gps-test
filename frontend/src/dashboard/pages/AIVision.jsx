import Card from '../components/Card';
import { detections } from '../data/simulation';

const PIPELINE = [
    { icon: 'photo_camera', label: 'Image Acquisition', detail: 'Multispectral / RGB array' },
    { icon: 'check_box', label: 'Object Detection', detail: 'YOLOv8 agronomy model (simulated)' },
    { icon: 'category', label: 'Classification', detail: 'Disease / pest recognition (simulated)' },
    { icon: 'location_on', label: 'Spatial Mapping', detail: 'Overlaying GPS data' },
];

function AIVision() {
    const avgConfidence = Math.round(detections.reduce((s, d) => s + d.confidence, 0) / detections.length);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
            <Card title="Camera Feed" icon="videocam" className="min-h-[420px] flex flex-col">
                <div className="flex-1 rounded-xl bg-primary/95 relative overflow-hidden min-h-[360px] flex items-center justify-center">
                    <p className="text-on-primary/60 text-sm max-w-xs text-center px-6">
                        Live ESP32-CAM stream not yet connected. Detections below are simulated for pipeline demonstration only.
                    </p>
                    <div className="absolute top-3 left-3 flex gap-2 text-[10px] font-bold uppercase">
                        <span className="bg-surface/90 text-on-surface px-2 py-1 rounded-lg">ROV-CAM-01</span>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-lg">Simulation</span>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col gap-5">
                <Card title="Current Analysis" icon="analytics">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Total Objects</p>
                            <p className="font-headline text-2xl font-bold text-on-surface">{detections.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Avg Confidence</p>
                            <p className="font-headline text-2xl font-bold text-on-surface">{avgConfidence}%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        {detections.map((d) => (
                            <div key={d.label} className="flex items-center gap-2 text-xs">
                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{d.icon}</span>
                                <span className="flex-1 text-on-surface">{d.label}</span>
                                <span className="font-mono-data text-on-surface-variant">{d.confidence}%</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="AI Pipeline" icon="account_tree">
                    <div className="flex flex-col gap-3">
                        {PIPELINE.map((p) => (
                            <div key={p.label} className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">{p.icon}</span>
                                <div>
                                    <p className="text-xs font-semibold text-on-surface">{p.label}</p>
                                    <p className="text-[11px] text-on-surface-variant">{p.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default AIVision;
