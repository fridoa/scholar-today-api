import mongoose, { Schema } from "mongoose";

export interface ILike {
  userId: number;
  postId: string;
  createdAt?: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: Number,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model<ILike>("Like", LikeSchema);
