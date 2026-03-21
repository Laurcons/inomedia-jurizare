/**
 * Load-test seed script: populates the database with large quantities of dummy data.
 * Run with: npm run seed:load
 */
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

const TeacherSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  school: String,
  locality: String,
  county: String,
  studentCount: String,
  votingMethod: { type: String, default: null },
  joinCode: { type: String, default: '' },
  previousCodes: { type: [String], default: [] },
  voteSubmitted: { type: Boolean, default: false },
  submittedRanking: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpSentAt: { type: Date, default: null },
});

const AdminSchema = new mongoose.Schema({
  email: String,
  name: String,
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpSentAt: { type: Date, default: null },
});

const VideoSchema = new mongoose.Schema({
  title: String,
  school: String,
  locality: String,
  county: String,
  thumbnailUrl: String,
  youtubeUrl: String,
});

const VotingStateSchema = new mongoose.Schema({
  status: { type: String, enum: ['not_started', 'active', 'stopped'], default: 'not_started' },
});

const Teacher = mongoose.model('Teacher', TeacherSchema);
const Admin = mongoose.model('Admin', AdminSchema);
const Video = mongoose.model('Video', VideoSchema);
const VotingState = mongoose.model('VotingState', VotingStateSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  await Promise.all([
    Teacher.deleteMany({}),
    Admin.deleteMany({}),
    Video.deleteMany({}),
    VotingState.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  const videos = Array.from({ length: 35 }, (_, i) => ({
    title: `Video ${i + 1}`,
    school: `School ${i + 1}`,
    locality: `Locality ${i + 1}`,
    county: `County ${i + 1}`,
    thumbnailUrl: `https://picsum.photos/seed/v${i + 1}/320/180`,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  }));
  await Video.insertMany(videos);
  console.log(`Created ${videos.length} videos.`);

  const teachers = Array.from({ length: 200 }, (_, i) => ({
    email: `teacher${i + 1}@test.com`,
    fullName: `Teacher ${i + 1}`,
    school: `School ${i + 1}`,
    locality: `Locality ${i + 1}`,
    county: `County ${i + 1}`,
    studentCount: '1',
  }));
  await Teacher.insertMany(teachers);
  console.log(`Created ${teachers.length} teachers.`);

  await Admin.insertMany([
    { email: 'admin1@test.com', name: 'Admin 1' },
    { email: 'admin2@test.com', name: 'Admin 2' },
  ]);
  console.log('Created 2 admins.');

  await VotingState.create({ status: 'not_started' });
  console.log('Created VotingState: not_started.');

  console.log('\n✓ Load seed complete.');
  console.log('  Admins:   admin1@test.com, admin2@test.com');
  console.log('  Teachers: teacher1@test.com … teacher200@test.com');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
