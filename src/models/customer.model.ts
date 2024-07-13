import mongoose, { Schema, Document, Model } from "mongoose";

interface CustomerDoc extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  salt: string;
  phone: string;
  address?: string;
  pincode?: string;
  password: string;
  isVerified: boolean;
  otp: number;
  otpExpiry: Date;
  lat?: number;
  lng?: number;
}

const CustomerSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    salt: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    pincode: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
    otp: { type: Number, required: true },
    otpExpiry: { type: Date, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
  }
);

const Customer: Model<CustomerDoc> = mongoose.model<CustomerDoc>(
  "customer",
  CustomerSchema
);
export { CustomerDoc, Customer };
