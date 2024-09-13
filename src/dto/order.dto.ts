import { IsEmpty } from "class-validator";

class cartItem {
  @IsEmpty()
  id: string;

  @IsEmpty()
  unit: number;
}
class orderInputs {
  txnId: string;
  amount: number;
  items: [cartItem];
}

export { cartItem, orderInputs };
