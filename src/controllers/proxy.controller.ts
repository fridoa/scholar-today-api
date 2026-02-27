import { Request, Response } from "express";
import jsonPlaceholderService from "../services/jsonplaceholder.service";

export default {
  // Posts
  async getAllPosts(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get All Posts'
        #swagger.tags = ['Posts']
    */
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const result = await jsonPlaceholderService.getAllPosts(queryString);

      if (result && typeof result.totalCount === 'number') {
        res.status(200).json({ 
          message: "Data posts berhasil diambil", 
          data: result.data,
          pagination: {
            totalData: result.totalCount
          }
        });
      } else {
        res.status(200).json({ message: "Data posts berhasil diambil", data: result });
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPostById(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get Post by ID'
        #swagger.tags = ['Posts']
    */
    try {
      const post = await jsonPlaceholderService.getPostById(req.params.id as string);
      res.status(200).json({ message: "Data post berhasil diambil", data: post });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPostsByUserId(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get Posts by User ID'
        #swagger.tags = ['Posts', 'Users']
    */
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
    /*
        #swagger.summary = 'Get Comments by Post ID'
        #swagger.tags = ['Comments', 'Posts']
    */
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
    /*
        #swagger.summary = 'Get User by ID'
        #swagger.tags = ['Users']
    */
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
    /*
        #swagger.summary = 'Get Albums by User ID'
        #swagger.tags = ['Albums', 'Users']
    */
    try {
      const albums = await jsonPlaceholderService.getAlbumsByUserId(req.params.userId as string);
      res.status(200).json({ message: "Data albums berhasil diambil", data: albums });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async getPhotosByAlbumId(req: Request, res: Response) {
    /*
        #swagger.summary = 'Get Photos by Album ID'
        #swagger.tags = ['Photos', 'Albums']
    */
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
    /*
        #swagger.summary = 'Get Todos by User ID'
        #swagger.tags = ['Todos', 'Users']
    */
    try {
      const todos = await jsonPlaceholderService.getTodosByUserId(req.params.userId as string);
      res.status(200).json({ message: "Data todos berhasil diambil", data: todos });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
