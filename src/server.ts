import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';
import { User } from './modules/users/user.model';
import { Note } from './modules/notes/note.model';
import { Post } from './modules/posts/post.model';

async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');

  // create collections and the indexes
  await Promise.all([User.init(), Note.init(), Post.init()]);
  console.log('Indexes ready');

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
