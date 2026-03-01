import { Response } from "express";
import { IAuthRequest } from "../types/auth.type";
import LikeModel from "../models/like.model";
import PostModel from "../models/post.model";
import NotificationModel from "../models/notification.model";
import jsonPlaceholderService from "../services/jsonplaceholder.service";

/**
 * Resolve the owner (userId) of a post.
 * Local posts → MongoDB, JP posts → JSONPlaceholder API.
 */
async function getPostOwner(postId: string): Promise<number | null> {
  try {
    if (postId.startsWith("local-")) {
      const mongoId = postId.replace("local-", "");
      const post = await PostModel.findById(mongoId).select("userId").lean();
      return post?.userId ?? null;
    }
    const post = await jsonPlaceholderService.getPostById(postId);
    return (post as any)?.userId ?? null;
  } catch {
    return null;
  }
}

export default {
  async toggle(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Toggle Like on a Post'
        #swagger.tags = ['Likes']
    */
    try {
      const postId = req.params.id as string;
      const userId = req.body.userId as number;

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const existing = await LikeModel.findOne({ userId, postId });

      if (existing) {
        await LikeModel.deleteOne({ userId, postId });
        const count = await LikeModel.countDocuments({ postId });
        return res.status(200).json({
          message: "Post unliked",
          data: { liked: false, count },
        });
      }

      await LikeModel.create({ userId, postId });
      const count = await LikeModel.countDocuments({ postId });

      getPostOwner(postId).then((ownerId) => {
        if (ownerId && ownerId !== userId) {
          NotificationModel.create({
            userId: ownerId,
            fromUserId: userId,
            type: "like",
            postId,
            message: "liked your post",
          }).catch(() => {});
        }
      });

      res.status(201).json({
        message: "Post liked",
        data: { liked: true, count },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getStatus(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Like Status for a Post'
        #swagger.tags = ['Likes']
    */
    try {
      const postId = req.params.id as string;
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId query param is required", data: null });
      }

      const [liked, count] = await Promise.all([LikeModel.exists({ userId, postId }), LikeModel.countDocuments({ postId })]);

      res.status(200).json({
        message: "Like status retrieved",
        data: { liked: !!liked, count },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getBatchCounts(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Like Counts for Multiple Posts'
        #swagger.tags = ['Likes']
    */
    try {
      const { postIds, userId } = req.body as { postIds: string[]; userId?: number };

      if (!postIds || !Array.isArray(postIds)) {
        return res.status(400).json({ message: "postIds array is required", data: null });
      }

      // Get counts for all posts
      const counts = await LikeModel.aggregate([{ $match: { postId: { $in: postIds } } }, { $group: { _id: "$postId", count: { $sum: 1 } } }]);

      // Get liked status for current user
      const userLikes = userId
        ? await LikeModel.find({ userId, postId: { $in: postIds } })
            .select("postId")
            .lean()
        : [];

      const likedSet = new Set(userLikes.map((l) => l.postId));

      const result: Record<string, { count: number; liked: boolean }> = {};
      for (const id of postIds) {
        const found = counts.find((c) => c._id === id);
        result[id] = {
          count: found?.count || 0,
          liked: likedSet.has(id),
        };
      }

      res.status(200).json({
        message: "Batch like data retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
