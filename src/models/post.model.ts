import mongoose, { Schema } from "mongoose";

export interface IPost {
  userId: number;
  title: string;
  body: string;
  image?: string;
  imageFileId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    imageFileId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;
