import { useState, useRef } from 'react';

// Wraps any tappable element with a Material-style expanding ripple on
// pointerdown. Pure CSS animation (see .ripple-dot in index.css) — no
// animation library needed for a one-shot effect like this.
function Ripple({ as: Tag = 'div', className = '', children, ...props }) {
    const [ripples, setRipples] = useState([]);
    const idRef = useRef(0);

    function handlePointerDown(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const id = idRef.current++;
        setRipples((prev) => [...prev, { id, x, y, size }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
        props.onPointerDown?.(e);
    }

    return (
        <Tag {...props} onPointerDown={handlePointerDown} className={`relative overflow-hidden ${className}`}>
            {children}
            {ripples.map((r) => (
                <span
                    key={r.id}
                    className="ripple-dot"
                    style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
                />
            ))}
        </Tag>
    );
}

export default Ripple;
