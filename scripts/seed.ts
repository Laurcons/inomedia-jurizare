/**
 * Seed script: populates the database with sample data for development.
 * Run with: npm run seed
 */
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// Inline schemas to avoid Next.js model registration issues
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

const SAMPLE_VIDEOS = [
  {
    title: 'Ştefan cel Mare – Apărătorul Moldovei',
    school: 'Colegiul Național „Mihai Eminescu"',
    locality: 'Iași',
    county: 'Iași',
    thumbnailUrl: 'https://picsum.photos/seed/v1/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Evul Mediu',
  },
  {
    title: 'Mihai Viteazul și Unirea de la 1600',
    school: 'Liceul Teoretic „Nichita Stănescu"',
    locality: 'Ploiești',
    county: 'Prahova',
    thumbnailUrl: 'https://picsum.photos/seed/v2/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Evul Mediu',
  },
  {
    title: 'Revoluția de la 1848 în Principatele Române',
    school: 'Colegiul Național „Tudor Vladimirescu"',
    locality: 'Craiova',
    county: 'Dolj',
    thumbnailUrl: 'https://picsum.photos/seed/v3/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Modernă',
  },
  {
    title: 'Alexandru Ioan Cuza și reformele sale',
    school: 'Liceul Pedagogic „Spiru Haret"',
    locality: 'Focșani',
    county: 'Vrancea',
    thumbnailUrl: 'https://picsum.photos/seed/v4/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Modernă',
  },
  {
    title: 'Marea Unire din 1918',
    school: 'Colegiul Național „George Barițiu"',
    locality: 'Cluj-Napoca',
    county: 'Cluj',
    thumbnailUrl: 'https://picsum.photos/seed/v5/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Contemporană',
  },
  {
    title: 'Dacii și Decebal – Rezistența față de Roma',
    school: 'Liceul Teoretic „Simion Bărnuțiu"',
    locality: 'Zalău',
    county: 'Sălaj',
    thumbnailUrl: 'https://picsum.photos/seed/v6/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Antichitate',
  },
  {
    title: 'Vlad Țepeș și mitul Dracula',
    school: 'Colegiul Național „Radu Greceanu"',
    locality: 'Slatina',
    county: 'Olt',
    thumbnailUrl: 'https://picsum.photos/seed/v7/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Evul Mediu',
  },
  {
    title: 'Ecaterina Teodoroiu – Eroina de la Jiu',
    school: 'Liceul Militar „Dimitrie Cantemir"',
    locality: 'Breaza',
    county: 'Prahova',
    thumbnailUrl: 'https://picsum.photos/seed/v8/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Contemporană',
  },
  {
    title: 'Nicolae Bălcescu și idealul național',
    school: 'Colegiul Național „Frații Buzești"',
    locality: 'Craiova',
    county: 'Dolj',
    thumbnailUrl: 'https://picsum.photos/seed/v9/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Modernă',
  },
  {
    title: 'Avram Iancu – Crăișorul Munților',
    school: 'Liceul Teoretic „Avram Iancu"',
    locality: 'Brad',
    county: 'Hunedoara',
    thumbnailUrl: 'https://picsum.photos/seed/v10/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Modernă',
  },
  {
    title: 'Domnia lui Basarab I și întemeierea Țării Românești',
    school: 'Colegiul Național „Mircea cel Bătrân"',
    locality: 'Râmnicu Vâlcea',
    county: 'Vâlcea',
    thumbnailUrl: 'https://picsum.photos/seed/v11/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Evul Mediu',
  },
  {
    title: 'Revoluția Română din 1989',
    school: 'Liceul Teoretic „Onisifor Ghibu"',
    locality: 'Oradea',
    county: 'Bihor',
    thumbnailUrl: 'https://picsum.photos/seed/v12/320/180',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Epoca Contemporană',
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Clear existing data
  await Promise.all([Teacher.deleteMany({}), Admin.deleteMany({}), Video.deleteMany({}), VotingState.deleteMany({})]);
  console.log('Cleared existing data.');

  // Seed admin
  await Admin.create({
    email: 'admin@jurizare.ro',
    name: 'Administrator',
  });
  console.log('Created admin: admin@jurizare.ro');

  // Seed teachers
  await Teacher.create([
    {
      email: 'prof.ionescu@scoala-iasi.ro',
      fullName: 'Maria Ionescu',
      school: 'Colegiul Național „Mihai Eminescu"',
      locality: 'Iași',
      county: 'Iași',
      studentCount: '4+',
    },
    {
      email: 'prof.popescu@scoala-cluj.ro',
      fullName: 'Ion Popescu',
      school: 'Colegiul Național „George Barițiu"',
      locality: 'Cluj-Napoca',
      county: 'Cluj',
      studentCount: '2',
    },
    {
      email: 'prof.gheorghe@scoala-buc.ro',
      fullName: 'Elena Gheorghe',
      school: 'Liceul Teoretic „Nichita Stănescu"',
      locality: 'București',
      county: 'Ilfov',
      studentCount: '3',
    },
  ]);
  console.log('Created 3 teachers.');

  // Seed videos
  await Video.insertMany(SAMPLE_VIDEOS);
  console.log(`Created ${SAMPLE_VIDEOS.length} videos.`);

  // Seed VotingState
  await VotingState.create({ status: 'not_started' });
  console.log('Created VotingState: not_started.');

  console.log('\n✓ Seed complete.');
  console.log('\nAccounts:');
  console.log('  Admin:    admin@jurizare.ro');
  console.log('  Teacher 1: prof.ionescu@scoala-iasi.ro');
  console.log('  Teacher 2: prof.popescu@scoala-cluj.ro');
  console.log('  Teacher 3: prof.gheorghe@scoala-buc.ro');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
