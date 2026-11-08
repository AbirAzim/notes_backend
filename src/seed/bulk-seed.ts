import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { Note } from '../modules/notes/note.model';
import { Post } from '../modules/posts/post.model';

const SEED_DOMAIN = '@seed.local';
const USERS = 200;
const NOTES_PER_USER = 5;
const POSTS_PER_USER = 3;
const INTERESTS = [
  'chess',
  'reading',
  'music',
  'hiking',
  'coding',
  'cooking',
  'travel',
  'photography',
  'gaming',
  'football',
  'cricket',
  'movies',
  'art',
  'yoga',
  'cycling',
];

const pick = <T>(list: T[], n: number) => [...list].sort(() => Math.random() - 0.5).slice(0, n);

async function clean() {
  const seeded = await User.find({ email: { $regex: `${SEED_DOMAIN}$` } })
    .select('_id')
    .lean();
  const ids = seeded.map((u) => u._id);
  await Note.deleteMany({ owner: { $in: ids } });
  await Post.deleteMany({ author: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} seeded users and their notes/posts`);
}

async function seed() {
  // hash once and reuse: hashing 200 times at cost 12 would take minutes
  const password = await bcrypt.hash('supersecret1', 12);

  const users = await User.insertMany(
    Array.from({ length: USERS }, (_, i) => ({
      name: `Seed User ${i + 1}`,
      email: `user${i + 1}${SEED_DOMAIN}`,
      password,
      role: 'USER',
      emailVerified: true,
      interests: pick(INTERESTS, 1 + Math.floor(Math.random() * 4)),
    })),
  );

  const notes = users.flatMap((u) =>
    Array.from({ length: NOTES_PER_USER }, (_, i) => ({
      owner: u._id,
      title: `Note ${i + 1} of ${u.name}`,
      content: 'Seeded note content',
    })),
  );
  const posts = users.flatMap((u) =>
    Array.from({ length: POSTS_PER_USER }, (_, i) => ({
      author: u._id,
      title: `Post ${i + 1} by ${u.name}`,
      body: 'Seeded post body',
    })),
  );

  await Note.insertMany(notes, { ordered: false });
  await Post.insertMany(posts, { ordered: false });
  console.log(`Seeded ${users.length} users, ${notes.length} notes, ${posts.length} posts`);
}

async function main() {
  await mongoose.connect(env.MONGO_URI);
  await clean();
  if (!process.argv.includes('--clean')) await seed();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
