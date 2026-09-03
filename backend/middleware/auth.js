import jwt from 'jsonwebtoken';

export function signToken(user) {
    return jwt.sign({ sub: user._id.toString(), name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
