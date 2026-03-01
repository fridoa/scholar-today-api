import mongoose, { Schema } from "mongoose";

export type NotificationType = "like" | "follow" | "comment";

export interface INotification {
  userId: number;
  fromUserId: number;
  type: NotificationType;
  postId?: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    fromUserId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "follow", "comment"],
      required: true,
    },
    postId: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
