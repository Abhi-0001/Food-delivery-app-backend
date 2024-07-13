import mongoose, { Schema, Document, Model } from "mongoose";
import { FoodDoc } from "./food.model";

interface VandorDoc extends Document {
  name: string;
  email: string;
  foodType?: [string];
  pincode: string;
  address: string;
  phone: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: [string];
  rating?: number;
  foods: [FoodDoc | undefined];
}

const vandorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String },
    serviceAvailable: { type: Boolean },
    coverImages: { type: [String] },
    rating: { type: Number },
    foods: [{ type: Schema.Types.ObjectId, ref: "food" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
  }
);

const Vandor: Model<VandorDoc> = mongoose.model<VandorDoc>(
  "vandor",
  vandorSchema
);
export { VandorDoc, Vandor };
