import { Request, Response } from "express";
import jsonPlaceholderService from "../services/jsonplaceholder.service";

export default {
  // Posts
  async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await jsonPlaceholderService.getAllPosts();
      res.status(200).json({ message: "Data posts berhasil diambil", data: posts });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPostById(req: Request, res: Response) {
    try {
      const post = await jsonPlaceholderService.getPostById(req.params.id as string);
      res.status(200).json({ message: "Data post berhasil diambil", data: post });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPostsByUserId(req: Request, res: Response) {
    try {
      const posts = await jsonPlaceholderService.getPostsByUserId(req.params.userId as string);
      res.status(200).json({ message: "Data posts berhasil diambil", data: posts });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  // Comments
  async getCommentsByPostId(req: Request, res: Response) {
    try {
      const comments = await jsonPlaceholderService.getCommentsByPostId(req.params.postId as string);
      res.status(200).json({ message: "Data komentar berhasil diambil", data: comments });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  // Users
  async getUserById(req: Request, res: Response) {
    try {
      const user = await jsonPlaceholderService.getUserById(req.params.id as string);
      res.status(200).json({ message: "Data user berhasil diambil", data: user });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  // Albums & Photos
  async getAlbumsByUserId(req: Request, res: Response) {
    try {
      const albums = await jsonPlaceholderService.getAlbumsByUserId(req.params.userId as string);
      res.status(200).json({ message: "Data albums berhasil diambil", data: albums });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPhotosByAlbumId(req: Request, res: Response) {
    try {
      const photos = await jsonPlaceholderService.getPhotosByAlbumId(req.params.albumId as string);
      res.status(200).json({ message: "Data photos berhasil diambil", data: photos });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  // Todos
  async getTodosByUserId(req: Request, res: Response) {
    try {
      const todos = await jsonPlaceholderService.getTodosByUserId(req.params.userId as string);
      res.status(200).json({ message: "Data todos berhasil diambil", data: todos });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
