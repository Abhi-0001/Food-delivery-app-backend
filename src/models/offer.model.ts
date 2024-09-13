import mongoose, { Document, Schema } from "mongoose";

interface OfferDoc extends Document {
  offerType: string; // * Vandor/ Generic
  vandors: [any]; // * [vandorIds]
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

const OfferSchema = new Schema(
  {
    offerType: { type: String, require: true },
    vandors: {
      type: [{ type: Schema.Types.ObjectId, ref: "vandor" }],
    },
    title: { type: String, require: true },
    description: String,
    minValue: { type: Number, require: true },
    offerAmount: { type: Number, require: true },
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String, require: true },
    promoType: { type: String, require: true },
    bank: [{ type: String }],
    bins: [{ type: String }],
    pincode: { type: String, require: true },
    isActive: Boolean,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer, OfferDoc };
