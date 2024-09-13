import mongoose, { Document, Schema } from "mongoose";

interface OrderDoc extends Document {
  orderId: string;
  vandorId: string;
  items: [any];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  txnId: string;
  orderStatus: string; // * waiting / on way / packing / delivered / failed
  remarks: string;
  deliveryId: string;
  readyTime: number; // * max 30 min
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, require: true },

    vandorId: { type: String, require: true },
    items: {
      type: [
        {
          food: { type: Schema.Types.ObjectId, ref: "food", require: true },
          unit: { type: Number, require: true },
        },
      ],
      require: true,
    },
    totalAmount: { type: Number, require: true },
    paidAmount: { type: Number, require: true },
    orderDate: { type: Date, require: true },

    orderStatus: { type: String, require: true },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: String },
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

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order, OrderDoc };
