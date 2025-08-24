export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const products: Product[] = [
  {
    id: 'prod_SvWORQZntlwHny',
    priceId: 'price_1RzfLwFUBYwTdlMckPbqoeBD',
    name: 'Mutuus Premium Zugang',
    description: 'Mutuus Premium (19,99 €/Monat): Weniger Provision (5 %), keine Auszahlungsgebühr, Zugang zu Level 5 Jobs (ab 1.000 €), unbegrenzte Job-Posts, Priority Support, erweiterte Analytics, sichtbarer Premium-Status mit Gold-Badge.',
    mode: 'subscription'
  },
  {
    id: 'prod_SvWIH0IZwwY73q',
    priceId: 'price_1RzfFSFUBYwTdlMcL1q2vDFu',
    name: '1000 Karma Punkte',
    description: 'Für 2,99 erhalten Sie 1000 Karma Punkte auf ihr Mutuus-App Konto gutgeschrieben.',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};