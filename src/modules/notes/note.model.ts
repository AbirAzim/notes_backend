import { Schema, model, Types } from 'mongoose';

export interface INote {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    content: { type: String, default: '', maxlength: 10_000 },
  },
  { timestamps: true, versionKey: false },
);

// #3 "my notes": find({ owner }).sort({ _id: -1 }) + countDocuments({ owner }),
//    and cascade deleteMany({ owner }) when a user is deleted
noteSchema.index({ owner: 1, _id: -1 });

export const Note = model<INote>('Note', noteSchema);
