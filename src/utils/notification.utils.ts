function generateOTP() {
  // six digit otp generation
  const otp = Math.floor(100000 + Math.random() * 90000);
  // otp expiry time
  const otpExpiry = new Date();
  otpExpiry.setTime(new Date().getTime() + 60 * 30 * 1000);
  return { otp, otpExpiry };
}

export { generateOTP };
