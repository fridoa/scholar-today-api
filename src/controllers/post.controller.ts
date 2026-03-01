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
        #swagger.summary = 'Get All Posts (Merged)'
        #swagger.tags = ['Posts']
    */
    try {
      const queryString = new URLSearchParams(req.query as any).toString();

      // Fetch from both sources in parallel
      const [jpResult, dbPosts] = await Promise.all([jsonPlaceholderService.getAllPosts(queryString), PostModel.find().sort({ createdAt: -1 }).lean()]);

      // Normalize JSONPlaceholder posts
      const jpPosts = (jpResult && typeof jpResult.totalCount === "number" ? jpResult.data : jpResult) as any[];

      // Normalize DB posts to match JSONPlaceholder shape
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

      // DB posts first (newest), then JSONPlaceholder
      const merged = [...normalizedDbPosts, ...jpPosts];

      const totalCount = jpResult && typeof jpResult.totalCount === "number" ? jpResult.totalCount + dbPosts.length : merged.length;

      res.status(200).json({
        message: "Data posts berhasil diambil",
        data: merged,
        pagination: {
          totalData: totalCount,
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

      // Remove image from ImageKit if exists
      if (post.imageFileId) {
        try {
          await imageKitUtil.removeFile(post.imageFileId);
        } catch {
          // Continue even if image deletion fails
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
