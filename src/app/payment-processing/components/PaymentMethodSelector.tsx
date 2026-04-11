import React from 'react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
}

const paymentMethods = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    logo: '📱',
    description: 'Pay your 30% advance with MTN MoMo',
    color: 'bg-yellow-50 border-yellow-200',
    instructions: [
      'Use your MTN Mobile Money number for payment confirmation.',
      'We will contact you to complete the advance payment request.',
    ],
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    type: 'mobile_money',
    logo: '📲',
    description: 'Pay your 30% advance with Airtel Money',
    color: 'bg-red-50 border-red-200',
    instructions: [
      'Use your Airtel Money number for payment confirmation.',
      'We will contact you to complete the advance payment request.',
    ],
  },
];

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  phoneNumber,
  onPhoneNumberChange,
}: PaymentMethodSelectorProps) {
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
            onClick={() => onSelectMethod(method.id)}
            className={`w-full p-5 border-2 rounded-lg transition-all text-left ${
              selectedMethod === method.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : `${method.color} hover:border-gray-400 hover:shadow-sm`
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{method.logo}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{method.name}</p>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>

                {selectedMethod === method.id && method.instructions && (
                  <div
                    className={`mt-4 rounded-lg p-4 text-sm ${
                      method.id === 'mtn'
                        ? 'bg-yellow-100 text-yellow-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    <p className="font-medium mb-2">How it works</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {method.instructions.map((instruction) => (
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
            Your Phone Number (for order confirmation)
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="07XX XXX XXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-2">
            We&apos;ll contact you on this number to confirm your order and payment
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
              <li>MTN Mobile Money and Airtel Money are the only checkout methods</li>
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
