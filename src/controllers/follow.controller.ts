import { Response } from "express";
import { IAuthRequest } from "../types/auth.type";
import followService from "../services/follow.service";

export default {
  async toggle(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Toggle Follow a User'
        #swagger.tags = ['Follows']
    */
    try {
      const followingId = parseInt(req.params.id as string);
      const followerId = req.body.userId as number;

      if (!followerId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      if (followerId === followingId) {
        return res.status(400).json({ message: "You cannot follow yourself", data: null });
      }

      const result = await followService.toggle(followerId, followingId);

      res.status(200).json({
        message: result.followed ? "User followed" : "User unfollowed",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getStatus(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Follow Status for a User'
        #swagger.tags = ['Follows']
    */
    try {
      const followingId = parseInt(req.params.id as string);
      const followerId = parseInt(req.query.userId as string);

      if (!followerId) {
        return res.status(400).json({ message: "userId query param is required", data: null });
      }

      const result = await followService.getStatus(followerId, followingId);

      res.status(200).json({
        message: "Follow status retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getCounts(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Follow Counts for a User'
        #swagger.tags = ['Follows']
    */
    try {
      const userId = parseInt(req.params.id as string);

      const result = await followService.getCounts(userId);

      res.status(200).json({
        message: "Follow counts retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
