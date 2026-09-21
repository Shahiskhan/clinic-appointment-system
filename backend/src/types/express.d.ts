import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            admin?: JwtPayload & { sub: string; email: string; role: string };
        }
    }
}

export { };