import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import "server-only";

export const JWT_COOKIE_NAME = "degen-fund-auth-token";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return new TextEncoder().encode(secret);
};

export const generateJwtPayload = (wallet: string): PreSignJwtPayload => {
  return {
    sub: wallet,
  };
};

export const signPayload = async (preSignJwtPayload: PreSignJwtPayload) => {
  const secret = getJwtSecret();
  if (!secret) throw new Error("key not found");

  const signedJwt = new SignJWT(preSignJwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("https://lcoalhost:3000")
    .sign(secret);
  return signedJwt;
};

export const getJwt = async () => {
  const token = cookies().get(JWT_COOKIE_NAME);
  const secret = getJwtSecret();
  if (!token?.value || !secret) return;

  try {
    const { payload } = await jwtVerify(token.value, secret);
    return { value: token.value, decodedPayload: payload } as JwtDecoded;
  } catch (e) {}
};

export const authenticate = async () => {
  const jwt = await getJwt();
  return jwt;
};
