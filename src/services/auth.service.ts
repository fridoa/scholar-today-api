import UserModel from "../models/user.model";
import { generateToken } from "../utils/jwt";
import { TRegister, TLogin } from "../validators/auth.validate";
import jsonPlaceholderService from "./jsonplaceholder.service";

// Register
const registerUser = async (payload: TRegister) => {
  const jsonUser = await jsonPlaceholderService.getUserByEmail(payload.email);
  if (!jsonUser) {
    throw new Error("Email tidak terdaftar di sistem. Gunakan email yang valid.");
  }

  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const user = await UserModel.create({
    email: payload.email,
    password: payload.password,
  });

  return user;
};

// Login
const loginUser = async (payload: TLogin) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new Error("Email atau password salah");
  }

  const isPasswordValid = await user.comparePassword(payload.password);
  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
  });

  return token;
};

export default { registerUser, loginUser };
