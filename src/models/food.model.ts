import mongoose, { Document, Schema } from "mongoose";

interface FoodDoc extends Document {
  vandorId: string;
  name: string;
  description: string;
  category: string;
  foodType?: [string];
  readyTime: number;
  price: number;
  rating: number;
  images: [string];
}

const FoodSchema = new Schema(
  {
    vandorId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    foodType: { type: [String] },
    readyTime: { type: Number },
    price: { type: Number, required: true },
    rating: { type: Number },
    images: { type: [String] },
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

const Food = mongoose.model<FoodDoc>("food", FoodSchema);

export { Food, FoodDoc };
