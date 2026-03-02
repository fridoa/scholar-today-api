import mongoose, { Schema } from "mongoose";

export interface IFollow {
  followerId: number;
  followingId: number;
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
  },
  {
    timestamps: true,
  },
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 });

export default mongoose.model<IFollow>("Follow", FollowSchema);
