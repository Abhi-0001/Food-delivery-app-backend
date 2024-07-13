import twilio from "twilio";

async function onRequestOTP(otp: number, toPhone: string) {
  const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const PHONE_FROM = process.env.TWILIO_PHONE_FROM;
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  const sms = await client.messages.create({
    body: `your OTP to verify Food Delivery account is: ${otp}`,
    from: PHONE_FROM,
    to: `+91${toPhone}`,
  });
  return sms;
}

export { onRequestOTP };
