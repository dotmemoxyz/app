import { verifySIWS } from "@talismn/siws";
import { SignJWT } from "jose/jwt/sign";
import { decode } from "jose/base64url";

type VerifyRequest = {
  signature: string;
  message: string;
  address: string;
};

export default defineEventHandler(async (event) => {
  const nonce = getCookie(event, "siws-nonce");

  if (!nonce) {
    throw new Error("No nonce found");
  }

  const { signature, message, address } = await readBody<VerifyRequest>(event);
  const verified = await verifySIWS(message, signature, address);

  if (nonce !== verified.nonce) {
    throw new Error("Nonce does not match");
  }

  const payload = {
    address: verified.address,
    // exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
  };

  const JWT_SECRET = "secret";
  const jwtKey = decode(JWT_SECRET);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    // .setIssuedAt()
    // .setExpirationTime('7d') // Token expires in 7 days
    .sign(jwtKey);

  return token;
});
