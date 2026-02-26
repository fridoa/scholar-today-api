import mongoose, { Model, Schema } from "mongoose";
import { hashPassword, verifyPassword } from "../utils/encryption";

export interface IUser {
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(passwordInput: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) {
    return;
  }

  user.password = await hashPassword(user.password);
});

UserSchema.methods.comparePassword = function (passwordInput: string): Promise<boolean> {
  return verifyPassword(passwordInput, this.password);
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const UserModel = mongoose.model<IUser, UserModel>("User", UserSchema);

export default UserModel;
