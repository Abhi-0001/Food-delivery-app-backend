import { IsEmail, Length } from "class-validator";

class CreateCustomerInput {
  @IsEmail()
  email: string;

  @Length(10)
  phone: string;

  @Length(8, 20)
  password: string;
}

class CustomerPayload {
  id: string;
  email: string;
  isVerified: boolean;
}

class CustomerLoginInput {
  @IsEmail()
  email: string;

  @Length(8, 20)
  password: string;
}
class CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  address?: string;
  pincode?: string;
}

export {
  CreateCustomerInput,
  CustomerPayload,
  CustomerLoginInput,
  CustomerUpdateInput,
};
