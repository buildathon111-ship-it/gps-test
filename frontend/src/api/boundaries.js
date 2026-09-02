const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getBoundaries() {
    const res = await fetch(`${API_BASE}/boundaries`);
    if (!res.ok) throw new Error('Failed to fetch boundaries');
    return res.json();
}

export async function getBoundary(id) {
    const res = await fetch(`${API_BASE}/boundaries/${id}`);
    if (!res.ok) throw new Error('Failed to fetch boundary');
    return res.json();
}

export async function saveBoundary(data) {
    const res = await fetch(`${API_BASE}/boundaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save boundary');
    return res.json();
}

export async function deleteBoundary(id) {
    const res = await fetch(`${API_BASE}/boundaries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete boundary');
    return res.json();
}
