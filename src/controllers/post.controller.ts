import { Request, Response } from "express";
import PostModel from "../models/post.model";
import { IAuthRequest } from "../types/auth.type";
import jsonPlaceholderService from "../services/jsonplaceholder.service";
import imageKitUtil from "../utils/imagekit";

export default {
  async create(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Create Post'
        #swagger.tags = ['Posts']
    */
    try {
      const { userId, title, body, image, imageFileId } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({
          message: "userId, title, and body are required",
          data: null,
        });
      }

      const post = await PostModel.create({
        userId,
        title,
        body,
        image: image || null,
        imageFileId: imageFileId || null,
      });

      res.status(201).json({
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getAll(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get All Posts (Merged with Unified Pagination)'
        #swagger.tags = ['Posts']
    */
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 10;
      const start = (page - 1) * limit;

      const [dbCount, jpCountResult] = await Promise.all([
        PostModel.countDocuments(),
        jsonPlaceholderService.getPostsPaginated(0, 1), // just to get totalCount header
      ]);

      const jpTotalCount = jpCountResult.totalCount;
      const totalData = dbCount + jpTotalCount;

      const dbSkip = Math.min(start, dbCount);
      const dbTake = Math.max(0, Math.min(limit, dbCount - start));
      const jpNeeded = limit - dbTake;
      const jpStart = Math.max(0, start - dbCount);

      const [dbPosts, jpResult] = await Promise.all([
        dbTake > 0 ? PostModel.find().sort({ createdAt: -1 }).skip(dbSkip).limit(dbTake).lean() : Promise.resolve([]),
        jpNeeded > 0 ? jsonPlaceholderService.getPostsPaginated(jpStart, jpNeeded) : Promise.resolve({ data: [], totalCount: jpTotalCount }),
      ]);

      const normalizedDbPosts = dbPosts.map((post) => ({
        userId: post.userId,
        id: `local-${post._id}`,
        title: post.title,
        body: post.body,
        image: post.image || null,
        imageFileId: post.imageFileId || null,
        createdAt: post.createdAt,
        isLocal: true,
      }));

      const data = [...normalizedDbPosts, ...(jpResult.data as any[])];

      res.status(200).json({
        message: "Data posts berhasil diambil",
        data,
        pagination: {
          totalData,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getByUserId(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get Posts by User ID (Merged)'
        #swagger.tags = ['Posts', 'Users']
    */
    try {
      const userId = req.params.userId as string;

      const [jpPosts, dbPosts] = await Promise.all([
        jsonPlaceholderService.getPostsByUserId(userId),
        PostModel.find({ userId: Number(userId) })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const normalizedDbPosts = dbPosts.map((post) => ({
        userId: post.userId,
        id: `local-${post._id}`,
        title: post.title,
        body: post.body,
        image: post.image || null,
        imageFileId: post.imageFileId || null,
        createdAt: post.createdAt,
        isLocal: true,
      }));

      const merged = [...normalizedDbPosts, ...(jpPosts as any[])];

      res.status(200).json({
        message: "Data posts berhasil diambil",
        data: merged,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getById(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get Post by ID (Local or JSONPlaceholder)'
        #swagger.tags = ['Posts']
    */
    try {
      const { id } = req.params;

      if (typeof id === "string" && id.startsWith("local-")) {
        const mongoId = id.replace("local-", "");
        const dbPost = await PostModel.findById(mongoId).lean();

        if (!dbPost) {
          return res.status(404).json({ message: "Post not found", data: null });
        }

        return res.status(200).json({
          message: "Data post berhasil diambil",
          data: {
            userId: dbPost.userId,
            id: `local-${dbPost._id}`,
            title: dbPost.title,
            body: dbPost.body,
            image: dbPost.image || null,
            imageFileId: dbPost.imageFileId || null,
            createdAt: dbPost.createdAt,
            isLocal: true,
          },
        });
      }

      const post = await jsonPlaceholderService.getPostById(id as string);
      res.status(200).json({ message: "Data post berhasil diambil", data: post });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async delete(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Delete Post'
        #swagger.tags = ['Posts']
    */
    try {
      const { id } = req.params;

      const post = await PostModel.findById(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found", data: null });
      }

      if (post.imageFileId) {
        try {
          await imageKitUtil.removeFile(post.imageFileId);
        } catch (err) {
          console.error("Failed to remove image from ImageKit:", err);
        }
      }

      await PostModel.findByIdAndDelete(id);

      res.status(200).json({
        message: "Post deleted successfully",
        data: null,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
