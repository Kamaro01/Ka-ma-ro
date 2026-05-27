import React from 'react';
import Image from 'next/image';
import { paymentSettings } from '@/lib/payment-settings';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  advancePaymentAmount: number;
}

const paymentMethods = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    logo: '📱',
    description: 'Enter the MTN number you will pay from, then send the advance to Ka-ma-ro',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'airtel',
    name: 'More Payment Options',
    type: 'mobile_money',
    logo: '➕',
    description: 'Coming soon: Airtel, bank transfer, merchant code, or other options can be added here',
    color: 'bg-gray-50 border-gray-200',
    disabled: true,
  },
];

const getPaymentInstructions = (methodId: string, advancePaymentAmount: number) => {
  if (methodId === 'mtn') {
    return {
      receiver: paymentSettings.mtn.receiverName,
      amount: `${advancePaymentAmount.toLocaleString()} RWF`,
      qrImagePath: paymentSettings.mtn.qrImagePath,
      steps: [
        'Enter your own MTN number in the box below, for example 078xxxxxxx.',
        `Use your phone to send ${advancePaymentAmount.toLocaleString()} RWF to ${paymentSettings.mtn.receiverName}.`,
        'MTN will send you a confirmation screen or message on your phone.',
        'Enter your MTN Mobile Money PIN/password and choose YES to finish the payment.',
        `Your order stays pending until ${paymentSettings.mtn.receiverName} confirms the mobile money payment.`,
      ],
    };
  }

  return null;
};

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  phoneNumber,
  onPhoneNumberChange,
  advancePaymentAmount,
}: PaymentMethodSelectorProps) {
  const selectedPaymentInstructions = getPaymentInstructions(selectedMethod, advancePaymentAmount);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Select Payment Method</h2>
      <p className="text-sm text-gray-600 mb-6">
        📌 All orders require{' '}
        <span className="font-semibold text-blue-600">30% advance payment</span> before partner
        stock confirmation and processing
      </p>

      {/* Manual Payment Methods */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              if (!method.disabled) {
                onSelectMethod(method.id);
              }
            }}
            disabled={method.disabled}
            className={`w-full p-5 border-2 rounded-lg transition-all text-left ${
              selectedMethod === method.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : method.disabled
                  ? `${method.color} cursor-not-allowed opacity-70`
                  : `${method.color} hover:border-gray-400 hover:shadow-sm`
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{method.logo}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{method.name}</p>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                {method.disabled && (
                  <p className="mt-2 inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    Reserved for future payment methods
                  </p>
                )}

                {selectedMethod === method.id && selectedPaymentInstructions && (
                  <div
                    className={`mt-4 rounded-lg p-4 text-sm ${
                      method.id === 'mtn'
                        ? 'bg-yellow-100 text-yellow-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    <p className="font-medium mb-2">How it works</p>
                    <div className="mb-3 rounded-md bg-white/70 p-3">
                      <div className="mb-3 grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide opacity-80">
                            Customer number
                          </p>
                          <p className="font-semibold">{phoneNumber || 'Eg: 078xxxxxxx'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide opacity-80">
                            Ka-ma-ro receives
                          </p>
                          <p className="font-semibold">{selectedPaymentInstructions.receiver}</p>
                        </div>
                      </div>
                      <p className="text-xs uppercase tracking-wide opacity-80">Advance amount</p>
                      <p className="text-lg font-bold">{selectedPaymentInstructions.amount}</p>
                    </div>
                    <div className="mb-3 rounded-md border border-yellow-300 bg-white/80 p-3">
                      <p className="text-xs uppercase tracking-wide opacity-80">
                        Optional QR payment
                      </p>
                      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                        <Image
                          src={selectedPaymentInstructions.qrImagePath}
                          alt={`QR code for ${selectedPaymentInstructions.receiver} payment`}
                          width={160}
                          height={160}
                          className="rounded-md border border-gray-200 bg-white"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">Scan to pay if supported</p>
                          <p className="text-xs text-gray-700">
                            If your MTN app or wallet supports QR payment, you can scan this code
                            instead of typing payment details manually.
                          </p>
                          <p className="text-xs text-gray-700">
                            If scanning does not work on your phone, use the number and amount shown
                            above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {paymentSettings.marketing.badge}
                      </p>
                      <p className="mt-1 font-semibold text-blue-950">
                        {paymentSettings.marketing.headline}
                      </p>
                      <p className="mt-1 text-xs text-blue-900">
                        {paymentSettings.marketing.message}
                      </p>
                      <p className="mt-2 text-[11px] text-blue-700">
                        {paymentSettings.marketing.footer}
                      </p>
                    </div>
                    <ul className="space-y-1 list-disc list-inside">
                      {selectedPaymentInstructions.steps.map((instruction) => (
                        <li key={instruction}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Contact Information Section */}
      {selectedMethod && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your MTN Number Paying From
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="Eg: 078xxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-2">
            This is the number you will use to confirm the MTN payment with your PIN/password.
          </p>
        </div>
      )}

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-2">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900 mb-1">Important Payment Terms:</p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Pay 30% of total amount as advance payment</li>
              <li>No card payment is taken on the website</li>
              <li>Customer enters their own MTN number, then confirms payment on their phone</li>
              <li>{paymentSettings.mtn.receiverName} is shown as the payment receiver</li>
              <li>MTN Mobile Money is the main checkout method</li>
              <li>More payment options can be added later without changing the checkout flow</li>
              <li>We confirm partner stock before pickup or delivery</li>
              <li>Remaining 70% payable on delivery</li>
              <li>Order processing starts after advance payment confirmation</li>
              <li>Estimated delivery: 3-5 business days after payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
