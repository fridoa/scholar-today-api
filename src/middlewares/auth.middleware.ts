import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validate";
import { IAuthRequest } from "../types/auth.type";
import { getUserData } from "../utils/jwt";

const validateRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });

    next();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      message: err.message,
      data: null,
    });
  }
};

const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });

    next();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      message: err.message,
      data: null,
    });
  }
};

const authorization = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  const userData = getUserData(token);

  if (!userData) {
    return res.status(401).json({
      message: "Invalid token payload",
    });
  }

  req.user = {
    id: userData.id,
    email: userData.email,
  };

  next();
};

export default { validateRegister, validateLogin, authorization };
