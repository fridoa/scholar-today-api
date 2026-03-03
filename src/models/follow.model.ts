import mongoose, { Schema } from "mongoose";

export type FollowStatus = "pending" | "accepted";

export interface IFollow {
  followerId: number;
  followingId: number;
  status: FollowStatus;
  createdAt?: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Number,
      required: true,
    },
    followingId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 });
FollowSchema.index({ followingId: 1, status: 1 });

export default mongoose.model<IFollow>("Follow", FollowSchema);
