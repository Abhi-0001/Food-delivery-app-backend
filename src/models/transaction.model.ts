import mongoose, { Document, Schema } from "mongoose";

interface TransactionDoc extends Document {
  customer: string;
  vandorId: string;
  orderId: string;
  orderValue: number;
  offerUsed: string;
  status: string;
  paymentMode: string;
  paymentResponse: string;
}

const TransactionSchema = new Schema(
  {
    customer: String,
    vandorId: String,
    orderId: String,
    orderValue: Number,
    offerUsed: String,
    status: String,
    paymentMode: String,
    paymentResponse: String,
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

const Transaction = mongoose.model<TransactionDoc>(
  "transaction",
  TransactionSchema
);

export { Transaction, TransactionDoc };
