import { Request, Response } from "express";
import imageKitUtil from "../utils/imagekit";

export default {
  async upload(req: Request, res: Response) {
    /*
        #swagger.summary = 'Upload Image'
        #swagger.tags = ['Media']
        #swagger.consumes = ['multipart/form-data']
    */
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded", data: null });
      }

      const result = await imageKitUtil.uploadSingle(req.file, "posts");

      res.status(200).json({
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async remove(req: Request, res: Response) {
    /*
        #swagger.summary = 'Remove Image'
        #swagger.tags = ['Media']
    */
    try {
      const fileId = req.params.fileId as string;

      if (!fileId) {
        return res.status(400).json({ message: "fileId is required", data: null });
      }

      await imageKitUtil.removeFile(fileId);

      res.status(200).json({
        message: "File removed successfully",
        data: null,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
