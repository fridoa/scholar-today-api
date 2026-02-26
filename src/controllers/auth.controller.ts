import { Request, Response } from "express";
import { TRegister } from "../validators/auth.validate";
import { IAuthRequest } from "../types/auth.type";
import authService from "../services/auth.service";
import jsonPlaceholderService from "../services/jsonplaceholder.service";

export default {
  // Register
  async register(req: Request, res: Response) {
    /*
        #swagger.summary = 'User Registration'
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Register" }
            }
          }
        }
    */
    try {
      const user = await authService.registerUser(req.body as TRegister);

      res.status(200).json({
        message: "Registrasi Berhasil",
        data: user,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  // Login
  async login(req: Request, res: Response) {
    /*
        #swagger.summary = 'User Login'
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" }
            }
          }
        }
    */
    try {
      const token = await authService.loginUser(req.body);

      res.status(200).json({
        message: "Login Berhasil",
        data: token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  // Get User Profile
  async getUserProfile(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get User Profile (from JSONPlaceholder)'
        #swagger.tags = ['Auth']
        #swagger.description = 'Fetches the user profile from JSONPlaceholder based on the email encoded in the JWT.'
    */
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({
        message: "Gagal mengidentifikasi pengguna dari token",
        data: null,
      });
    }

    try {
      const profile = await jsonPlaceholderService.getUserByEmail(email);

      if (!profile) {
        return res.status(404).json({
          message: "Profil pengguna tidak ditemukan di JSONPlaceholder",
          data: null,
        });
      }

      res.status(200).json({
        message: "Data profil berhasil diambil",
        data: profile,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        message: err.message,
        data: null,
      });
    }
  },
};
