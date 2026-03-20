import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeacher extends Document {
  email: string;
  fullName: string;
  school: string;
  locality: string;
  county: string;
  studentCount: '1' | '2' | '3' | '4+';
  votingMethod: 'simple' | 'students' | null;
  joinCode: string;
  previousCodes: string[];
  voteSubmitted: boolean;
  submittedRanking: Types.ObjectId[];
  otp: string | null;
  otpExpiry: Date | null;
  otpSentAt: Date | null;
}

const TeacherSchema = new Schema<ITeacher>({
  email: { type: String, required: true, unique: true, lowercase: true },
  fullName: { type: String, required: true },
  school: { type: String, required: true },
  locality: { type: String, required: true },
  county: { type: String, required: true },
  studentCount: { type: String, enum: ['1', '2', '3', '4+'], required: true },
  votingMethod: { type: String, enum: ['simple', 'students'], default: null },
  joinCode: { type: String, default: '' },
  previousCodes: { type: [String], default: [] },
  voteSubmitted: { type: Boolean, default: false },
  submittedRanking: { type: [Schema.Types.ObjectId], ref: 'Video', default: [] },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpSentAt: { type: Date, default: null },
});

export default (mongoose.models.Teacher as mongoose.Model<ITeacher>) ||
  mongoose.model<ITeacher>('Teacher', TeacherSchema);
