export const paymentSettings = {
  mtn: {
    methodName: 'MTN Mobile Money',
    receiverName: 'Ka-ma-ro',
    receiverNumber: '0788812376',
    qrImagePath: '/assets/qr-code-design.svg',
  },
  marketing: {
    badge: 'Special Offer',
    headline: 'Fast order confirmation for mobile money customers',
    message:
      'Pay your advance, keep your order number, and we will confirm partner stock before pickup or delivery.',
    footer:
      'You can update this space later for promotions, delivery offers, or new payment methods.',
  },
} as const;
