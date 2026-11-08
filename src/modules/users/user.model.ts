import { Schema, model, Types } from 'mongoose';

export const ROLES = ['USER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  emailVerified: boolean;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'USER' },
    emailVerified: { type: Boolean, default: false },
    interests: {
      type: [{ type: String, trim: true, lowercase: true, minlength: 1, maxlength: 50 }],
      default: [],
      validate: {
        validator: (list: string[]) => list.length <= 20,
        message: 'A user can have at most 20 interests',
      },
    },
  },
  { timestamps: true, versionKey: false },
);

// ---------------- Indexes ----------------
// #1 login lookup, duplicate-email check, email uniqueness
userSchema.index({ email: 1 }, { unique: true });

// #2 Scenario 1: $match on interests before $unwind/$group (multikey)
userSchema.index({ interests: 1 });

// never send the password hash, even from create()/save()
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _password, ...rest } = ret;
    return rest;
  },
});

export const User = model<IUser>('User', userSchema);
