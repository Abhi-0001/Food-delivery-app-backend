export interface OfferInput {
  offerType: string; // * Vandor/ Generic
  title: string; //*  40% or INR200 off on week days
  description: string; //* like terms & conditions
  minValue: number; //* min purchase amount
  offerAmount: number; //* 200
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string; //* for particular USER or All or BANK or CARD
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}
