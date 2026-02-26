import { Request } from "express";
import { Types } from "mongoose";

export interface ITokenPayload {
  id: Types.ObjectId;
  email: string;
}

export interface IAuthRequest extends Request {
  user?: ITokenPayload;
}
