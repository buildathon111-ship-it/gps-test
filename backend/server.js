import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import boundaryRoutes from './routes/boundaries.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/boundaries', boundaryRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`AgriRover backend running on http://localhost:${PORT}`);
    });
});
