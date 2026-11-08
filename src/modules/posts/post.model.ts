import { Schema, model, Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    body: { type: String, required: true, minlength: 1, maxlength: 10_000 },
  },
  { timestamps: true, versionKey: false },
);

// #4 Scenario 2: $lookup posts where author = user._id, sorted newest first,
//    and cascade deleteMany({ author }) when a user is deleted
postSchema.index({ author: 1, _id: -1 });

export const Post = model<IPost>('Post', postSchema);
