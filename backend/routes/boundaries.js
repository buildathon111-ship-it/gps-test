import { Router } from 'express';
import Boundary from '../models/Boundary.js';

const router = Router();

// GET /api/boundaries - list all saved boundaries (most recent first)
router.get('/', async (req, res) => {
    try {
        const boundaries = await Boundary.find().sort({ createdAt: -1 });
        res.json(boundaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/boundaries/:id - get a single boundary
router.get('/:id', async (req, res) => {
    try {
        const boundary = await Boundary.findById(req.params.id);
        if (!boundary) return res.status(404).json({ error: 'Boundary not found' });
        res.json(boundary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/boundaries - save a new boundary
router.post('/', async (req, res) => {
    try {
        const { projectName, points, pointCount, areaSquareMeters, areaHectares, distanceMeters } = req.body;

        if (!Array.isArray(points) || points.length < 3) {
            return res.status(400).json({ error: 'A boundary needs at least 3 points' });
        }

        const boundary = await Boundary.create({
            projectName,
            points,
            pointCount: pointCount ?? points.length,
            areaSquareMeters,
            areaHectares,
            distanceMeters
        });

        res.status(201).json(boundary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/boundaries/:id - delete a boundary
router.delete('/:id', async (req, res) => {
    try {
        const boundary = await Boundary.findByIdAndDelete(req.params.id);
        if (!boundary) return res.status(404).json({ error: 'Boundary not found' });
        res.json({ message: 'Boundary deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
