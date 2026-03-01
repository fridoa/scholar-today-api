import mongoose, { Schema } from "mongoose";

export interface IBookmark {
  userId: number;
  postId: string;
  createdAt?: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
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

BookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
