import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import proxyController from "../controllers/proxy.controller";

const router = Router();

router.post("/auth/register", authMiddleware.validateRegister, authController.register);
router.post("/auth/login", authMiddleware.validateLogin, authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/profile", authMiddleware.authorization, authController.getUserProfile);

router.get("/posts", authMiddleware.authorization, proxyController.getAllPosts);
router.get("/posts/:id", authMiddleware.authorization, proxyController.getPostById);
router.get("/users/:userId/posts", authMiddleware.authorization, proxyController.getPostsByUserId);
router.get("/posts/:postId/comments", authMiddleware.authorization, proxyController.getCommentsByPostId);

router.get("/users", authMiddleware.authorization, proxyController.getAllUsers);
router.get("/users/:id", authMiddleware.authorization, proxyController.getUserById);


router.get("/users/:userId/albums", authMiddleware.authorization, proxyController.getAlbumsByUserId);
router.get("/albums/:albumId/photos", authMiddleware.authorization, proxyController.getPhotosByAlbumId);

router.get("/users/:userId/todos", authMiddleware.authorization, proxyController.getTodosByUserId);

export default router;
