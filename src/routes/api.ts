import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import proxyController from "../controllers/proxy.controller";
import postController from "../controllers/post.controller";
import mediaController from "../controllers/media.controller";
import upload from "../middlewares/upload.middleware";

const router = Router();

router.post("/auth/register", authMiddleware.validateRegister, authController.register);
router.post("/auth/login", authMiddleware.validateLogin, authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/profile", authMiddleware.authorization, authController.getUserProfile);

router.get("/posts", authMiddleware.authorization, postController.getAll);
router.post("/posts", authMiddleware.authorization, postController.create);
router.delete("/posts/:id", authMiddleware.authorization, postController.delete);

router.get("/posts/:id", authMiddleware.authorization, proxyController.getPostById);
router.get("/users/:userId/posts", authMiddleware.authorization, postController.getByUserId);
router.get("/posts/:postId/comments", authMiddleware.authorization, proxyController.getCommentsByPostId);

router.post("/media/upload", authMiddleware.authorization, upload.single("image"), mediaController.upload);
router.delete("/media/:fileId", authMiddleware.authorization, mediaController.remove);

router.get("/users", authMiddleware.authorization, proxyController.getAllUsers);
router.get("/users/:id", authMiddleware.authorization, proxyController.getUserById);

router.get("/users/:userId/albums", authMiddleware.authorization, proxyController.getAlbumsByUserId);
router.get("/albums/:albumId/photos", authMiddleware.authorization, proxyController.getPhotosByAlbumId);

router.get("/users/:userId/todos", authMiddleware.authorization, proxyController.getTodosByUserId);

export default router;
