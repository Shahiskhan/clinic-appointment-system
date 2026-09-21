import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ENV } from '../config/env.js';


export const ensureAdmin = async (): Promise<void> => {
    const email = ENV.ADMIN_EMAIL.trim().toLowerCase();
    const password = ENV.ADMIN_PASSWORD.trim();

    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
    }

    const existingAdmin = await prisma.admin.findUnique({
        where: { email },
    });

    if (existingAdmin) {
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.admin.create({
        data: {
            email,
            name: ENV.ADMIN_NAME,
            passwordHash,
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log(`Initial admin created: ${email}`);
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
    }



    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
    }

    const token = jwt.sign(
        { sub: admin.id, email: admin.email, role: admin.role },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
        success: true,
        data: {
            token,
            admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        },
    });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.admin?.sub;
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!adminId || !currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: 'Current and new passwords are required' });
        return;
    }

    if (newPassword.length < 8) {
        res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
        return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin?.isActive || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
        res.status(401).json({ success: false, error: 'Current password is incorrect' });
        return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });

    res.json({ success: true, message: 'Password changed successfully' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
    if (!req.admin?.sub) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
    }

    const admin = await prisma.admin.findUnique({
        where: { id: req.admin.sub },
        select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!admin?.isActive) {
        res.status(401).json({ success: false, error: 'Admin account is inactive' });
        return;
    }

    res.json({ success: true, data: admin });
};