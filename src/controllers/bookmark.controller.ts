import { Response } from "express";
import { IAuthRequest } from "../types/auth.type";
import BookmarkModel from "../models/bookmark.model";

export default {
  async toggle(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Toggle Bookmark on a Post'
        #swagger.tags = ['Bookmarks']
    */
    try {
      const postId = req.params.id as string;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const existing = await BookmarkModel.findOne({ userId, postId });

      if (existing) {
        await BookmarkModel.deleteOne({ userId, postId });
        return res.status(200).json({
          message: "Bookmark removed",
          data: { bookmarked: false },
        });
      }

      await BookmarkModel.create({ userId, postId });

      res.status(201).json({
        message: "Post bookmarked",
        data: { bookmarked: true },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getStatus(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Bookmark Status for a Post'
        #swagger.tags = ['Bookmarks']
    */
    try {
      const postId = req.params.id as string;
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId query param is required", data: null });
      }

      const bookmarked = await BookmarkModel.exists({ userId, postId });

      res.status(200).json({
        message: "Bookmark status retrieved",
        data: { bookmarked: !!bookmarked },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getBatchStatus(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Bookmark Status for Multiple Posts'
        #swagger.tags = ['Bookmarks']
    */
    try {
      const { postIds, userId } = req.body as { postIds: string[]; userId: number };

      if (!postIds || !Array.isArray(postIds) || !userId) {
        return res.status(400).json({ message: "postIds array and userId are required", data: null });
      }

      const userBookmarks = await BookmarkModel.find({ userId, postId: { $in: postIds } })
        .select("postId")
        .lean();

      const bookmarkedSet = new Set(userBookmarks.map((b) => b.postId));

      const result: Record<string, { bookmarked: boolean }> = {};
      for (const id of postIds) {
        result[id] = { bookmarked: bookmarkedSet.has(id) };
      }

      res.status(200).json({
        message: "Batch bookmark data retrieved",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
