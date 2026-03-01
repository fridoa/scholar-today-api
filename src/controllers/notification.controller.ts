import { Response } from "express";
import { IAuthRequest } from "../types/auth.type";
import NotificationModel from "../models/notification.model";

const NOTIFICATIONS_LIMIT = 30;

export default {
  async getByUser(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Get Notifications for a User'
        #swagger.tags = ['Notifications']
    */
    try {
      const userId = parseInt(req.params.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(NOTIFICATIONS_LIMIT).lean();

      const unreadCount = await NotificationModel.countDocuments({
        userId,
        isRead: false,
      });

      res.status(200).json({
        message: "Notifications retrieved",
        data: { notifications, unreadCount },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async markAsRead(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Mark a Notification as Read'
        #swagger.tags = ['Notifications']
    */
    try {
      const { id } = req.params;

      const notification = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });

      if (!notification) {
        return res.status(404).json({ message: "Notification not found", data: null });
      }

      res.status(200).json({
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },

  async markAllRead(req: IAuthRequest, res: Response) {
    /*
        #swagger.summary = 'Mark All Notifications as Read'
        #swagger.tags = ['Notifications']
    */
    try {
      const userId = parseInt(req.params.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "userId is required", data: null });
      }

      await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });

      res.status(200).json({
        message: "All notifications marked as read",
        data: null,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message, data: null });
    }
  },
};
