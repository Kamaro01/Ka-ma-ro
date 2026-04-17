import React from 'react';

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
    description: 'Submit your MTN number so we can request the 30% advance',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    type: 'mobile_money',
    logo: '📲',
    description: 'Optional: submit your Airtel number and we will contact you',
    color: 'bg-red-50 border-red-200',
  },
];

const MTN_PAYMENT_NUMBER = '0788812376';

const getPaymentInstructions = (methodId: string, advancePaymentAmount: number) => {
  if (methodId === 'mtn') {
    const ussdCode = `*182*1*1*${MTN_PAYMENT_NUMBER}*${advancePaymentAmount}#`;
    return {
      receiver: `MTN number: ${MTN_PAYMENT_NUMBER}`,
      ussdCode,
      dialHref: `tel:${ussdCode.replace('#', '%23')}`,
      steps: [
        `Dial ${ussdCode}`,
        'Enter your MTN Mobile Money PIN/password.',
        'Choose YES to confirm the payment.',
        'Your order stays pending until Ka-ma-ro confirms the mobile money payment.',
      ],
    };
  }

  if (methodId === 'airtel') {
    return {
      receiver: 'Airtel is optional and handled manually by Ka-ma-ro.',
      ussdCode: '',
      dialHref: '',
      steps: [
        'Submit your Airtel Money number with the order.',
        'Ka-ma-ro will contact you before requesting any Airtel payment.',
        'If Airtel is not available for your order, we will help you complete payment by MTN instead.',
        'Your order stays pending until Ka-ma-ro confirms the mobile money payment.',
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

                {selectedMethod === method.id && selectedPaymentInstructions && (
                  <div
                    className={`mt-4 rounded-lg p-4 text-sm ${
                      method.id === 'mtn'
                        ? 'bg-yellow-100 text-yellow-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    <p className="font-medium mb-2">How it works</p>
                    <p className="mb-2">{selectedPaymentInstructions.receiver}</p>
                    {selectedPaymentInstructions.ussdCode && (
                      <div className="mb-3 rounded-md bg-white/70 p-3">
                        <p className="text-xs uppercase tracking-wide opacity-80">Payment code</p>
                        <p className="font-mono font-semibold break-all">
                          {selectedPaymentInstructions.ussdCode}
                        </p>
                        <a
                          href={selectedPaymentInstructions.dialHref}
                          className="mt-2 inline-flex rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Call MTN payment code
                        </a>
                      </div>
                    )}
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
            Your Mobile Money Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="07XX XXX XXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-2">
            We&apos;ll use this number to confirm the order and request the advance payment
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
              <li>MTN customers can use the shown USSD code to send the advance payment</li>
              <li>We will contact you if we need extra confirmation before processing</li>
              <li>MTN Mobile Money is the main checkout method</li>
              <li>Airtel Money is optional and confirmed manually before payment</li>
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
