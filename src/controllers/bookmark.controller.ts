import { Response } from "express";
import { IAuthRequest } from "../types/auth.type";
import BookmarkModel from "../models/bookmark.model";
import PostModel from "../models/post.model";
import jsonPlaceholderService from "../services/jsonplaceholder.service";

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

  async getByUser(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get All Bookmarked Posts for a User'
        #swagger.tags = ['Bookmarks']
    */
    try {
      const userId = parseInt(req.params.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const bookmarks = await BookmarkModel.find({ userId }).sort({ createdAt: -1 }).lean();

      if (bookmarks.length === 0) {
        return res.status(200).json({
          message: "No bookmarked posts",
          data: [],
        });
      }

      const localIds: string[] = [];
      const jpIds: string[] = [];

      for (const bm of bookmarks) {
        if (bm.postId.startsWith("local-")) {
          localIds.push(bm.postId.replace("local-", ""));
        } else {
          jpIds.push(bm.postId);
        }
      }

      const localPosts = localIds.length > 0 ? await PostModel.find({ _id: { $in: localIds } }).lean() : [];

      const localPostMap = new Map(
        localPosts.map((p) => [
          `local-${p._id}`,
          {
            userId: p.userId,
            id: `local-${p._id}`,
            title: p.title,
            body: p.body,
            image: p.image || null,
            imageFileId: p.imageFileId || null,
            createdAt: p.createdAt,
            isLocal: true,
          },
        ]),
      );

      const jpPosts = await Promise.all(
        jpIds.map(async (id) => {
          try {
            return await jsonPlaceholderService.getPostById(id);
          } catch {
            return null;
          }
        }),
      );

      const jpPostMap = new Map(jpPosts.filter(Boolean).map((p: any) => [String(p.id), p]));

      const posts = bookmarks.map((bm) => localPostMap.get(bm.postId) || jpPostMap.get(bm.postId)).filter(Boolean);

      res.status(200).json({
        message: "Bookmarked posts retrieved",
        data: posts,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
