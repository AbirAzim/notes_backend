import mongoose, { Types } from 'mongoose';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { Note } from '../modules/notes/note.model';
import { Post } from '../modules/posts/post.model';

// walk an explain() result and collect every value stored under `key`
function collect(obj: unknown, key: string, out: unknown[] = []): unknown[] {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === key) out.push(v);
      collect(v, key, out);
    }
  }
  return out;
}

const sum = (values: unknown[]) => values.reduce<number>((a, v) => a + (typeof v === 'number' ? v : 0), 0);

function summarize(query: string, explain: unknown) {
  const plans = collect(explain, 'winningPlan');
  const stages = [...new Set(collect(plans, 'stage') as string[])];
  const indexes = [
    ...new Set([...collect(plans, 'indexName'), ...(collect(explain, 'indexesUsed').flat() as unknown[])]),
  ];
  return {
    query,
    stages: stages.join(' > '),
    indexes: indexes.join(', ') || '-',
    keysExamined: sum(collect(explain, 'totalKeysExamined')),
    docsExamined: sum(collect(explain, 'totalDocsExamined')),
  };
}

async function main() {
  await mongoose.connect(env.MONGO_URI);

  const user = await User.findOne({ email: 'user1@seed.local' }).lean();
  if (!user) throw new Error('Run "npm run seed" first');
  const note = await Note.findOne({ owner: user._id }).lean();
  const id = new Types.ObjectId(String(user._id));

  const rows = [
    summarize('login: findOne({ email })', await User.findOne({ email: user.email }).explain('executionStats')),

    summarize(
      'my notes: find({ owner }).sort({ _id: -1 }).limit(10)',
      await Note.find({ owner: id }).sort({ _id: -1 }).limit(10).explain('executionStats'),
    ),

    summarize(
      'my notes count: { owner }',
      await Note.aggregate([{ $match: { owner: id } }, { $count: 'n' }]).explain('executionStats'),
    ),

    summarize(
      'get note: findOne({ _id, owner })',
      await Note.findOne({ _id: note!._id, owner: id }).explain('executionStats'),
    ),

    summarize(
      'admin users: find().sort({ _id: -1 }).limit(10)',
      await User.find().sort({ _id: -1 }).limit(10).explain('executionStats'),
    ),

    summarize(
      'admin notes: find().sort({ _id: -1 }).limit(10)',
      await Note.find().sort({ _id: -1 }).limit(10).explain('executionStats'),
    ),

    summarize(
      'scenario 1 (filtered): $match interests',
      await User.aggregate([
        { $match: { interests: { $in: ['chess'] } } },
        { $project: { name: 1, interests: 1 } },
        { $unwind: '$interests' },
        { $match: { interests: { $in: ['chess'] } } },
        { $group: { _id: '$interests', count: { $sum: 1 } } },
      ]).explain('executionStats'),
    ),

    summarize(
      'scenario 1 (unfiltered): all users',
      await User.aggregate([
        { $project: { name: 1, interests: 1 } },
        { $unwind: '$interests' },
        { $group: { _id: '$interests', count: { $sum: 1 } } },
      ]).explain('executionStats'),
    ),

    summarize(
      'scenario 2: $lookup posts by author',
      await User.aggregate([
        { $match: { _id: id } },
        { $project: { name: 1 } },
        {
          $lookup: {
            from: Post.collection.name,
            localField: '_id',
            foreignField: 'author',
            as: 'posts',
            pipeline: [{ $sort: { _id: -1 } }, { $limit: 10 }],
          },
        },
      ]).explain('executionStats'),
    ),
  ];

  console.table(rows);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});