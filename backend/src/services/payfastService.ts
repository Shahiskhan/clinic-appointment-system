import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

export interface PayFastInitiateParams {
  appointmentId: string;
  amount: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
}

export interface PayFastFormPayload {
  merchant_id: string;
  secured_key: string;
  basket_id: string;
  txnamt: string;
  customer_mobile_no: string;
  customer_email_address: string;
  order_date: string;
  currency_code: string;
  token?: string;
  signature: string;
  checkout_url: string;
}

export class PayFastService {
  static verifyIPNSignature(ipnData: any): boolean {
    const providedSignature = ipnData.signature || ipnData.SIGNATURE || ipnData.hash;
    if (!providedSignature) return false;

    const basketId = ipnData.basket_id || ipnData.BASKET_ID || ipnData.order_id || '';
    const amount = Number(ipnData.txnamt || ipnData.TXNAMT || ipnData.amount || 0).toFixed(2);
    const candidates = [
      `${ENV.PAYFAST_MERCHANT_ID}${ENV.PAYFAST_SECURED_KEY}${basketId}${amount}`,
      `${ENV.PAYFAST_SECURED_KEY}${basketId}${amount}${ENV.PAYFAST_PASSPHRASE}`,
    ];

    return candidates.some(value => crypto.createHash('sha256').update(value).digest('hex') === String(providedSignature).toLowerCase());
  }

  /**
   * Generates a signed PayFast checkout payload for Pakistan e-commerce checkout
   */
  static async initiateCheckout(params: PayFastInitiateParams): Promise<PayFastFormPayload> {
    const { appointmentId, amount, patientName, patientPhone, patientEmail = 'patient@clinic.com' } = params;

    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formattedAmount = amount.toFixed(2);

    // Generate PayFast Security Signature: SHA256(MERCHANT_ID + SECURED_KEY + BASKET_ID + TXNAMT)
    const signatureString = `${ENV.PAYFAST_MERCHANT_ID}${ENV.PAYFAST_SECURED_KEY}${appointmentId}${formattedAmount}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // Generated PayFast Token / Transaction Ref
    const generatedToken = `PF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const checkoutUrl =
      ENV.PAYFAST_ENV === 'production'
        ? 'https://ipg.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken'
        : 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken';

    // Save transaction in database
    await prisma.paymentTransaction.create({
      data: {
        appointmentId,
        gateway: 'PAYFAST',
        amount,
        currency: 'PKR',
        status: 'PENDING',
        gatewayReference: generatedToken,
        signature,
        metadata: JSON.stringify({
          patientName,
          patientPhone,
          patientEmail,
          basket_id: appointmentId,
          initiatedAt: formattedDate,
        }),
      },
    });

    return {
      merchant_id: ENV.PAYFAST_MERCHANT_ID,
      secured_key: ENV.PAYFAST_SECURED_KEY,
      basket_id: appointmentId,
      txnamt: formattedAmount,
      customer_mobile_no: patientPhone,
      customer_email_address: patientEmail,
      order_date: formattedDate,
      currency_code: 'PKR',
      token: generatedToken,
      signature,
      checkout_url: checkoutUrl,
    };
  }

  /**
   * Validates PayFast IPN (Instant Payment Notification) Callback
   */
  static async handleIPN(ipnData: any): Promise<{ success: boolean; appointmentId?: string }> {
    // PayFast IPN parameters: basket_id, err_code, transaction_id, err_msg
    const basketId = ipnData.basket_id || ipnData.BASKET_ID || ipnData.order_id;
    const errCode = ipnData.err_code || ipnData.ERR_CODE || ipnData.status_code;
    const transactionId = ipnData.transaction_id || ipnData.TRANSACTION_ID || ipnData.rrn;

    if (!basketId) {
      throw new Error('Invalid IPN: Missing basket_id');
    }

    const providedSignature = ipnData.signature || ipnData.SIGNATURE || ipnData.hash;
    if (providedSignature && !this.verifyIPNSignature(ipnData)) {
      throw new Error('Invalid PayFast IPN signature');
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: basketId },
      include: { transactions: true },
    });

    if (!appointment) {
      console.warn(`No appointment found matching PayFast basket_id: ${basketId}`);
      return { success: false };
    }

    // "000" in PayFast denotes success
    const isSuccess = errCode === '000' || errCode === '00' || ipnData.status === 'success';

    if (isSuccess) {
      await prisma.$transaction([
        prisma.appointment.update({
          where: { id: basketId },
          data: { paymentStatus: 'PAID' },
        }),
        prisma.paymentTransaction.updateMany({
          where: { appointmentId: basketId, gateway: 'PAYFAST' },
          data: {
            status: 'PAID',
            gatewayReference: transactionId || 'PF_CONFIRMED',
            metadata: JSON.stringify({
              ipnPayload: ipnData,
              reconciledAt: new Date().toISOString(),
            }),
          },
        }),
      ]);
    } else {
      await prisma.appointment.update({
        where: { id: basketId },
        data: { paymentStatus: 'FAILED' },
      });
    }

    return {
      success: isSuccess,
      appointmentId: basketId,
    };
  }
}
