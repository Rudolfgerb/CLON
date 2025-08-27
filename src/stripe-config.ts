// Stripe product configurations
export const STRIPE_PRODUCTS = {
  premium: {
    id: 'prod_SvWORQZntlwHny',
    priceId: 'price_1RzfLwFUBYwTdlMckPbqoeBD',
    name: 'Mutuus Premium Zugang',
    price: '19,99 €',
    period: '/Monat',
    mode: 'subscription' as const,
    description: 'Mutuus Premium (19,99 €/Monat): Weniger Provision (5 %), keine Auszahlungsgebühr, Zugang zu Level 5 Jobs (ab 1.000 €), unbegrenzte Job-Posts, Priority Support, erweiterte Analytics, sichtbarer Premium-Status mit Gold-Badge.',
    features: [
      'Nur 5% Provision statt 9.8%',
      'Keine Auszahlungsgebühr',
      'Zugang zu Level 5 Jobs (ab 1.000 €)',
      'Unbegrenzte Job-Posts',
      'Priority Support',
      'Erweiterte Analytics',
      'Gold-Badge Premium-Status'
    ]
  },
  karma_1000: {
    id: 'prod_SvWIH0IZwwY73q',
    priceId: 'price_1RzfFSFUBYwTdlMcL1q2vDFu',
    name: '1000 Karma Punkte',
    price: '2,99 €',
    karma: 1000,
    mode: 'payment' as const,
    description: 'Für 2,99 € erhalten Sie 1000 Karma Punkte auf ihr Mutuus-App Konto gutgeschrieben.',
    features: [
      '1000 Karma Punkte',
      'Sofort nach Zahlung verfügbar',
      'Für Community Jobs verwenden',
      'Karma-Level verbessern'
    ]
  }
};

export const COMMISSION_RATES = {
  regular: 0.098, // 9.8%
  premium: 0.05   // 5%
};