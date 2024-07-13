interface CreateVandorInput {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  pincode: string;
  address: string;
  foodType: string;
  password: string;
  serviceAvailable: boolean;
  rating: number;
}

interface LoginVandorInput {
  email: string;
  password: string;
}

interface VandorPayload {
  id: string;
  name: string;
  email: string;
  foodType?: [string];
}

interface VandorProfileUpdate {
  name: string;
  foodType?: [string];
  phone?: string;
  address: string;
  pincode: string;
}

export {
  CreateVandorInput,
  LoginVandorInput,
  VandorPayload,
  VandorProfileUpdate,
};
