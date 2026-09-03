import { Router } from 'express';
import User from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { findClosestMatch } from '../utils/faceMatch.js';

const router = Router();

function isValidDescriptor(d) {
    return Array.isArray(d) && d.length === 128 && d.every((n) => typeof n === 'number' && Number.isFinite(n));
}

// POST /api/auth/signup - { name, faceDescriptor } -> creates a user, rejects
// if a matching face already exists (one account per face).
router.post('/signup', async (req, res) => {
    try {
        const { name, faceDescriptor } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!isValidDescriptor(faceDescriptor)) {
            return res.status(400).json({ error: 'A valid face scan is required' });
        }

        const existingUsers = await User.find({}, { name: 1, faceDescriptor: 1 });
        if (findClosestMatch(faceDescriptor, existingUsers)) {
            return res.status(409).json({ error: 'This face is already registered. Try logging in instead.' });
        }

        const user = await User.create({ name: name.trim(), faceDescriptor });
        const token = signToken(user);
        res.status(201).json({ token, user: { id: user._id, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login - { faceDescriptor } -> finds the closest registered
// face within the match threshold and logs that user in.
router.post('/login', async (req, res) => {
    try {
        const { faceDescriptor } = req.body;
        if (!isValidDescriptor(faceDescriptor)) {
            return res.status(400).json({ error: 'A valid face scan is required' });
        }

        const users = await User.find({}, { name: 1, faceDescriptor: 1 });
        const match = findClosestMatch(faceDescriptor, users);
        if (!match) {
            return res.status(401).json({ error: 'Face not recognized. Please sign up first.' });
        }

        const token = signToken(match.user);
        res.json({ token, user: { id: match.user._id, name: match.user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me - validates a token on app load so a session survives refresh.
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.sub, { name: 1 });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: { id: user._id, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
