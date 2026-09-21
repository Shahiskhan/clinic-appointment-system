import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { PaymentMethod } from '../../types/clinic';

interface PaymentGatewayProps {
  amount: number;
  doctorName: string;
  patientName: string;
  onPaymentSuccess: (method: PaymentMethod, status: 'Paid' | 'Pending') => void;
  onBack: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  doctorName,
  patientName,
  onPaymentSuccess,
  onBack,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CashAtClinic');
  const isPaymentMethodEnabled = (method: PaymentMethod) => method === 'CashAtClinic';

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(patientName);
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('883');

  // Mobile Wallet Input
  const [walletNumber, setWalletNumber] = useState('0300 9876543');
  const [cnicLast6, setCnicLast6] = useState('482910');

  // OTP Sub-flow
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpError, setOtpError] = useState('');
  const mockValidOtp = '4821';

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, otpTimer]);

  const handleInitialPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'CashAtClinic') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess('CashAtClinic', 'Pending');
      }, 700);
      return;
    }

    // For Safepay and PayFast, simulate gateway API checkout flow
    if (selectedMethod === 'Safepay' || selectedMethod === 'PayFast') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsOtpStep(true);
        setOtpTimer(45);
      }, 600);
      return;
    }

    // Trigger OTP Step for Card / Wallets
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsOtpStep(true);
      setOtpTimer(45);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.trim() !== mockValidOtp && otpCode.trim() !== '1234') {
      setOtpError(`Invalid OTP entered. (For demo testing, enter "${mockValidOtp}")`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(selectedMethod, 'Paid');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {!isOtpStep ? (
        <>
          {/* Amount Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-indigo-200 font-medium block">
                Total Consultation Payable
              </span>
              <span className="text-2xl font-black tracking-tight text-teal-300">
                Rs. {amount.toLocaleString()}
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                For: {doctorName} • Patient: {patientName}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="flex items-center gap-1 text-xs text-teal-400 font-semibold bg-teal-900/50 border border-teal-500/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-bit SSL Encrypted
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Zero Convenience Fee
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Choose Payment Method (Pakistan)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Option 1: Safepay Pakistan */}
              <button
                type="button"
                onClick={() => isPaymentMethodEnabled('Safepay') && setSelectedMethod('Safepay')}
                disabled={!isPaymentMethodEnabled('Safepay')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'Safepay'
                    ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    SP
                  </div>
                  {selectedMethod === 'Safepay' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>Safepay</span>
                    <span className="bg-teal-100 text-teal-800 text-[9px] px-1 rounded font-bold">PK</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Cards / QR / Wallets</span>
                  <span className="text-[10px] font-bold text-rose-600">Coming soon</span>
                </div>
              </button>

              {/* Option 2: PayFast Pakistan */}
              <button
                type="button"
                onClick={() => isPaymentMethodEnabled('PayFast') && setSelectedMethod('PayFast')}
                disabled={!isPaymentMethodEnabled('PayFast')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'PayFast'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    PF
                  </div>
                  {selectedMethod === 'PayFast' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>PayFast</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1 rounded font-bold">APPS</span>
                  </div>
                  <span className="text-[10px] text-slate-500">1Link / UnionPay / Bank</span>
                  <span className="text-[10px] font-bold text-rose-600">Coming soon</span>
                </div>
              </button>

              {/* Option 3: JazzCash */}
              <button
                type="button"
                onClick={() => isPaymentMethodEnabled('JazzCash') && setSelectedMethod('JazzCash')}
                disabled={!isPaymentMethodEnabled('JazzCash')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'JazzCash'
                    ? 'border-red-600 bg-red-50/30 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    JC
                  </div>
                  {selectedMethod === 'JazzCash' && (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">JazzCash</div>
                  <span className="text-[10px] text-slate-500">Mobile Wallet / MPIN</span>
                  <span className="text-[10px] font-bold text-rose-600">Coming soon</span>
                </div>
              </button>

              {/* Option 4: EasyPaisa */}
              <button
                type="button"
                onClick={() => isPaymentMethodEnabled('EasyPaisa') && setSelectedMethod('EasyPaisa')}
                disabled={!isPaymentMethodEnabled('EasyPaisa')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'EasyPaisa'
                    ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    EP
                  </div>
                  {selectedMethod === 'EasyPaisa' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">EasyPaisa</div>
                  <span className="text-[10px] text-slate-500">Instant Wallet Debit</span>
                  <span className="text-[10px] font-bold text-rose-600">Coming soon</span>
                </div>
              </button>

              {/* Option 5: Credit / Debit Card */}
              <button
                type="button"
                onClick={() => isPaymentMethodEnabled('Card') && setSelectedMethod('Card')}
                disabled={!isPaymentMethodEnabled('Card')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'Card'
                    ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  {selectedMethod === 'Card' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Visa / Mastercard</div>
                  <span className="text-[10px] text-slate-500">Direct Card Entry</span>
                  <span className="text-[10px] font-bold text-rose-600">Coming soon</span>
                </div>
              </button>

              {/* Option 6: Pay at Clinic */}
              <button
                type="button"
                onClick={() => setSelectedMethod('CashAtClinic')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${selectedMethod === 'CashAtClinic'
                    ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {selectedMethod === 'CashAtClinic' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Pay at Clinic</div>
                  <span className="text-[10px] text-slate-500">Cash on Arrival</span>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Form for chosen method */}
          <form onSubmit={handleInitialPay} className="space-y-4">

            {/* 1. Safepay Sandbox Form */}
            {selectedMethod === 'Safepay' && (
              <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-teal-900 font-bold">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span>Safepay Pakistan Checkout (Sandbox)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-200/70 text-teal-900 px-2 py-0.5 rounded-full">
                    API Connected
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-teal-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Tracker Session:</span>
                    <span className="font-mono text-teal-700 font-semibold">track_live_sync</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Currency:</span>
                    <span className="font-bold text-slate-800">PKR (Pakistani Rupee)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Webhook Verification:</span>
                    <span className="text-emerald-700 font-semibold">HMAC SHA-256 Enabled</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Mobile / EasyPaisa / JazzCash / Card Account
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* 2. PayFast Pakistan Form */}
            {selectedMethod === 'PayFast' && (
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-indigo-900 font-bold">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>PayFast Pakistan Merchant Gateway (1Link / APPS)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded-full">
                    IPN Enabled
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Merchant ID:</span>
                    <span className="font-mono font-semibold text-indigo-700">10000 (Sandbox)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IPN Callback:</span>
                    <span className="font-mono text-[10px] text-slate-500">/api/payments/payfast/webhook</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile / Bank Account Number
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. Card Form */}
            {selectedMethod === 'Card' && (
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV / CVC
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                        required
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. JazzCash Form */}
            {selectedMethod === 'JazzCash' && (
              <div className="bg-red-50/40 p-5 rounded-2xl border border-red-200/80 space-y-3.5">
                <div className="flex items-center gap-2 text-xs text-red-800 font-semibold mb-1">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  JazzCash Mobile Account Checkout
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    JazzCash Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Holder CNIC (Last 6 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={cnicLast6}
                    onChange={(e) => setCnicLast6(e.target.value)}
                    placeholder="e.g. 789123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    You will receive an USSD prompt or SMS OTP to complete authorization.
                  </span>
                </div>
              </div>
            )}

            {/* 5. EasyPaisa Form */}
            {selectedMethod === 'EasyPaisa' && (
              <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/80 space-y-3.5">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  EasyPaisa Direct Debit
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    EasyPaisa Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="0345 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* 6. Pay at Clinic */}
            {selectedMethod === 'CashAtClinic' && (
              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  Reserve Slot Now — Pay Cash at Reception
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your appointment slot will be immediately confirmed and reserved under your name. Please arrive <strong>15 minutes prior</strong> to your consultation time to pay Rs. {amount.toLocaleString()} in cash or via card POS at the reception counter.
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back to Details
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Gateway...</span>
                  </>
                ) : selectedMethod === 'CashAtClinic' ? (
                  <>
                    <span>Confirm Walk-in / Reservation</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Pay Rs. {amount.toLocaleString()} via {selectedMethod}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* OTP Verification Step */
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Two-Factor OTP Verification
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              A 4-digit security code has been generated for authentication with {selectedMethod} Pakistan.
            </p>

            <div className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
              Demo Test Code: <strong className="font-mono">{mockValidOtp}</strong>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="max-w-xs mx-auto space-y-4">
            <div>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                autoFocus
              />
            </div>

            {otpError && (
              <p className="text-xs text-rose-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {otpError}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Time Remaining:</span>
              <span className="font-bold font-mono text-teal-700">
                00:{String(otpTimer).padStart(2, '0')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing || otpCode.length < 4}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying & Authorizing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Rs. {amount.toLocaleString()}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsOtpStep(false)}
              className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold text-center"
            >
              Change Payment Method / Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
