import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User, type Role } from '../src/modules/users/user.model';
import { Note } from '../src/modules/notes/note.model';
import { Post } from '../src/modules/posts/post.model';
import { signAccessToken } from '../src/utils/tokens';

let replSet: MongoMemoryReplSet;

// replica set (not a single server) because the admin cascade delete uses a transaction
export async function connectTestDb() {
  console.time('mongo:start');
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  console.timeEnd('mongo:start');

  console.time('mongo:connect');
  // fail fast with a real error instead of buffering silently
  await mongoose.connect(replSet.getUri(), { serverSelectionTimeoutMS: 10_000 });
  console.timeEnd('mongo:connect');

  console.time('mongo:indexes');
  await Promise.all([User.init(), Note.init(), Post.init()]);
  console.timeEnd('mongo:indexes');
}

export async function clearTestDb() {
  await Promise.all([User.deleteMany({}), Note.deleteMany({}), Post.deleteMany({})]);
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
  await replSet?.stop();
}

export async function createUser(name: string, role: Role = 'USER', interests: string[] = []) {
  const user = await User.create({
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@test.local`,
    password: await bcrypt.hash('supersecret1', 4),
    role,
    emailVerified: true,
    interests,
  });
  return { user, id: String(user._id), token: signAccessToken(String(user._id), role) };
}
