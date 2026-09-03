// Below this distance, two face descriptors are considered the same person.
// face-api.js's own docs recommend ~0.6 as the boundary for its recognition
// model; we go slightly tighter to reduce false-accept risk.
export const MATCH_THRESHOLD = 0.5;

export function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// Returns the closest user (and distance) from a list, or null if none are
// within MATCH_THRESHOLD.
export function findClosestMatch(descriptor, users) {
    let best = null;
    for (const user of users) {
        const distance = euclideanDistance(descriptor, user.faceDescriptor);
        if (distance <= MATCH_THRESHOLD && (!best || distance < best.distance)) {
            best = { user, distance };
        }
    }
    return best;
}
