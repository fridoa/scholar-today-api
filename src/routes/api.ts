import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import proxyController from "../controllers/proxy.controller";

const router = Router();

// Auth (public)
router.post("/auth/register", authMiddleware.validateRegister, authController.register);
router.post("/auth/login", authMiddleware.validateLogin, authController.login);

// Protected routes (perlu Bearer token)
router.get("/auth/profile", authMiddleware.authorization, authController.getUserProfile);

// Posts
router.get("/posts", authMiddleware.authorization, proxyController.getAllPosts);
router.get("/posts/:id", authMiddleware.authorization, proxyController.getPostById);
router.get("/users/:userId/posts", authMiddleware.authorization, proxyController.getPostsByUserId);

// Comments
router.get("/posts/:postId/comments", authMiddleware.authorization, proxyController.getCommentsByPostId);

// Users
router.get("/users/:id", authMiddleware.authorization, proxyController.getUserById);

// Albums & Photos
router.get("/users/:userId/albums", authMiddleware.authorization, proxyController.getAlbumsByUserId);
router.get("/albums/:albumId/photos", authMiddleware.authorization, proxyController.getPhotosByAlbumId);

// Todos
router.get("/users/:userId/todos", authMiddleware.authorization, proxyController.getTodosByUserId);

export default router;
