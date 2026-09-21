import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  // Local MySQL ki jagah Supabase URL fallback add kar dein (optional)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Shahiskhanktk@db.mobfcxotabrygmcqxgqd.supabase.co:5432/postgres',

  // Safepay Pakistan
  SAFEPAY_API_KEY: process.env.SAFEPAY_API_KEY || 'sec_sandbox_example_key_safepay',
  SAFEPAY_SECRET_KEY: process.env.SAFEPAY_SECRET_KEY || 'sandbox_secret_key_safepay',
  SAFEPAY_WEBHOOK_SECRET: process.env.SAFEPAY_WEBHOOK_SECRET || 'sandbox_webhook_secret_32chars',
  SAFEPAY_BASE_URL: process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com',

  // PayFast Pakistan
  PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID || '10000',
  PAYFAST_SECURED_KEY: process.env.PAYFAST_SECURED_KEY || 'test_secured_key_payfast',
  PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE || 'test_passphrase_payfast',
  PAYFAST_ENV: process.env.PAYFAST_ENV || 'sandbox',
  PAYFAST_IPN_URL: process.env.PAYFAST_IPN_URL || 'http://localhost:5000/api/payments/payfast/webhook',

  // CORS Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'replace-this-development-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@medicare.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe!123',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
  ACTIVE_PAYMENT_METHOD: process.env.ACTIVE_PAYMENT_METHOD || 'CASH_AT_CLINIC',
};

if (process.env.NODE_ENV === 'production' && ENV.JWT_SECRET === 'replace-this-development-secret') {
  throw new Error('JWT_SECRET must be set to a strong value in production');
}