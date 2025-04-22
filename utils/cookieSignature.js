import crypto from "crypto";

export const signValue = (value, secret) => {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
  return `${value}.${signature}`;
};

export const verifyValue = (signedValue, secret) => {
  const [value, signature] = signedValue.split(".");
  if (!value || !signature) return null;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
  return signature === expectedSignature ? value : null;
};