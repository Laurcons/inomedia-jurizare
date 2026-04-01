/**
 * Test seed script: wipes the DB and populates it with deterministic data for E2E tests.
 * OTPs are pre-set to '000000' with a far-future expiry.
 * Requires DEV_MODE=true in .env.local for the OTP bypass to work.
 * Run with: npm run seed:test
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

const StudentVoteSchema = new mongoose.Schema({
  teacherId: mongoose.Schema.Types.ObjectId,
  studentName: String,
  studentClass: String,
  ranking: [mongoose.Schema.Types.ObjectId],
  removed: { type: Boolean, default: false },
});

const Teacher = mongoose.model('Teacher', TeacherSchema);
const Admin = mongoose.model('Admin', AdminSchema);
const Video = mongoose.model('Video', VideoSchema);
const VotingState = mongoose.model('VotingState', VotingStateSchema);
const StudentVote = mongoose.model('StudentVote', StudentVoteSchema);

// Far-future expiry so OTP never expires during tests
const OTP_EXPIRY = new Date('2099-01-01T00:00:00Z');
const TEST_OTP = '000000';

const TEST_VIDEOS = [
  { title: 'Video Test 1', school: 'Scoala Test 1', locality: 'Iași', county: 'Iași', thumbnailUrl: 'https://picsum.photos/seed/t1/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 2', school: 'Scoala Test 2', locality: 'Cluj-Napoca', county: 'Cluj', thumbnailUrl: 'https://picsum.photos/seed/t2/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 3', school: 'Scoala Test 3', locality: 'Timișoara', county: 'Timiș', thumbnailUrl: 'https://picsum.photos/seed/t3/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 4', school: 'Scoala Test 4', locality: 'Brașov', county: 'Brașov', thumbnailUrl: 'https://picsum.photos/seed/t4/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 5', school: 'Scoala Test 5', locality: 'Constanța', county: 'Constanța', thumbnailUrl: 'https://picsum.photos/seed/t5/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 6', school: 'Scoala Test 6', locality: 'Galați', county: 'Galați', thumbnailUrl: 'https://picsum.photos/seed/t6/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 7', school: 'Scoala Test 7', locality: 'Craiova', county: 'Dolj', thumbnailUrl: 'https://picsum.photos/seed/t7/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 8', school: 'Scoala Test 8', locality: 'Ploiești', county: 'Prahova', thumbnailUrl: 'https://picsum.photos/seed/t8/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 9', school: 'Scoala Test 9', locality: 'Oradea', county: 'Bihor', thumbnailUrl: 'https://picsum.photos/seed/t9/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Video Test 10', school: 'Scoala Test 10', locality: 'Bacău', county: 'Bacău', thumbnailUrl: 'https://picsum.photos/seed/t10/320/180', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  await Promise.all([
    Teacher.deleteMany({}),
    Admin.deleteMany({}),
    Video.deleteMany({}),
    VotingState.deleteMany({}),
    StudentVote.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  await Admin.create({
    email: 'admin@test.ro',
    name: 'Admin Test',
    otp: TEST_OTP,
    otpExpiry: OTP_EXPIRY,
    otpSentAt: new Date(),
  });
  console.log('Created admin: admin@test.ro');

  await Teacher.create([
    {
      email: 'teacher.simple@test.ro',
      fullName: 'Profesor Test Simple',
      school: 'Scoala Test',
      locality: 'Iași',
      county: 'Iași',
      studentCount: '1',
      otp: TEST_OTP,
      otpExpiry: OTP_EXPIRY,
      otpSentAt: new Date(),
    },
    {
      email: 'teacher.students@test.ro',
      fullName: 'Profesor Test Students',
      school: 'Scoala Test 2',
      locality: 'Cluj-Napoca',
      county: 'Cluj',
      studentCount: '4+',
      otp: TEST_OTP,
      otpExpiry: OTP_EXPIRY,
      otpSentAt: new Date(),
    },
    {
      // Pre-configured for student-flow tests: known join code so student tests
      // can navigate directly to /student/ABCDEF without reading a dynamic code.
      email: 'teacher.ready@test.ro',
      fullName: 'Profesor Test Ready',
      school: 'Scoala Test 3',
      locality: 'Timișoara',
      county: 'Timiș',
      studentCount: '4+',
      votingMethod: 'students',
      joinCode: 'ABCDEF',
      otp: TEST_OTP,
      otpExpiry: OTP_EXPIRY,
      otpSentAt: new Date(),
    },
  ]);
  console.log('Created 3 teachers: teacher.simple@test.ro, teacher.students@test.ro, teacher.ready@test.ro');

  await Video.insertMany(TEST_VIDEOS);
  console.log(`Created ${TEST_VIDEOS.length} videos.`);

  await VotingState.create({ status: 'not_started' });
  console.log('Created VotingState: not_started.');

  console.log('\n✓ Test seed complete.');
  console.log('\nTest accounts (OTP: 000000, requires DEV_MODE=true):');
  console.log('  Admin:             admin@test.ro');
  console.log('  Teacher (simple):  teacher.simple@test.ro');
  console.log('  Teacher (students): teacher.students@test.ro');
  console.log('  Teacher (ready):    teacher.ready@test.ro  (students method, joinCode=ABCDEF)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Test seed failed:', err);
  process.exit(1);
});
