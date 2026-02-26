import jwt from "jsonwebtoken";
import { env } from "./env";
import { ITokenPayload } from "../types/auth.type";

export const generateToken = (payload: ITokenPayload): string => {
  if (!env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET is not defined");
  }

  const tokenPayload: ITokenPayload = {
    id: payload.id,
    email: payload.email,
  };

  return jwt.sign(tokenPayload, env.JWT_SECRET_KEY, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const getUserData = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET_KEY) as ITokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
