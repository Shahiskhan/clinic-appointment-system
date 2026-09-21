import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.header('Authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ success: false, error: 'Authorization token is required' });
        return;
    }

    try {
        const payload = jwt.verify(token, ENV.JWT_SECRET);
        if (typeof payload === 'string' || payload.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Admin access required' });
            return;
        }

        req.admin = payload as Request['admin'];
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Invalid or expired authorization token' });
    }
};