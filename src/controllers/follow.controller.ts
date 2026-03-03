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
        message: result.isPending ? "Follow request sent" : "User unfollowed",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPendingRequests(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Pending Follow Requests for a User'
        #swagger.tags = ['Follows']
    */
    try {
      const userId = parseInt(req.params.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const requests = await followService.getPendingRequests(userId);

      res.status(200).json({
        message: "Pending follow requests retrieved",
        data: requests,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async accept(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Accept a Follow Request'
        #swagger.tags = ['Follows']
    */
    try {
      const fromUserId = parseInt(req.params.fromUserId as string);
      const toUserId = req.body.userId as number;

      if (!fromUserId || !toUserId) {
        return res.status(400).json({ message: "fromUserId param and userId body are required", data: null });
      }

      await followService.accept(fromUserId, toUserId);

      res.status(200).json({ message: "Follow request accepted", data: null });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async reject(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Reject a Follow Request'
        #swagger.tags = ['Follows']
    */
    try {
      const fromUserId = parseInt(req.params.fromUserId as string);
      const toUserId = req.body.userId as number;

      if (!fromUserId || !toUserId) {
        return res.status(400).json({ message: "fromUserId param and userId body are required", data: null });
      }

      await followService.reject(fromUserId, toUserId);

      res.status(200).json({ message: "Follow request rejected", data: null });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getFriends(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Mutual Follows (Friends) for a User'
        #swagger.tags = ['Follows']
    */
    try {
      const userId = parseInt(req.params.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const friendIds = await followService.getFriends(userId);

      res.status(200).json({
        message: "Friends retrieved",
        data: friendIds,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getInfo(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Follow Info (status + counts) for a User'
        #swagger.tags = ['Follows']
    */
    try {
      const followingId = parseInt(req.params.id as string);
      const followerId = parseInt(req.query.userId as string);

      if (!followerId) {
        return res.status(400).json({ message: "userId query param is required", data: null });
      }

      const result = await followService.getInfo(followerId, followingId);

      res.status(200).json({
        message: "Follow info retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getBatch(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Follow Info for Multiple Users'
        #swagger.tags = ['Follows']
    */
    try {
      const { userIds, userId } = req.body as { userIds: number[]; userId: number };

      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds array is required", data: null });
      }

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const result = await followService.getBatch(userIds, userId);

      res.status(200).json({
        message: "Batch follow info retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
