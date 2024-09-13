import mongoose, { Schema, Document, Model } from "mongoose";

interface DeliveryUserDoc extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  salt: string;
  phone: string;
  address: string;
  pincode: string;
  password: string;
  isVerified: boolean;
  otp: number;
  otpExpiry: Date;
  lat?: number;
  lng?: number;
  isAvailable: boolean;
}

const DeliveryUserSchema = new Schema(
  {
    firstName: { type: String, require: true },
    lastName: { type: String },
    email: { type: String, require: true },
    salt: { type: String, require: true },
    phone: { type: String, require: true },
    address: { type: String, require: true },
    pincode: { type: String, require: true },
    password: { type: String, require: true },
    isVerified: { type: Boolean, require: true },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean, require: true },
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

const DeliveryUser: Model<DeliveryUserDoc> = mongoose.model<DeliveryUserDoc>(
  "deliveryUser",
  DeliveryUserSchema
);
export { DeliveryUserDoc, DeliveryUser };
