import { VandorPayload } from "./vandor.dto";
import { CustomerPayload } from "./customer.dto";

type AuthPayload = VandorPayload | CustomerPayload;

export { AuthPayload };
