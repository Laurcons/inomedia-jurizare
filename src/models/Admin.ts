import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  name: string;
  canImpersonate: boolean;
  otp: string | null;
  otpExpiry: Date | null;
  otpSentAt: Date | null;
  otpAttempts: number;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  canImpersonate: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpSentAt: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
});

export default (mongoose.models.Admin as mongoose.Model<IAdmin>) || mongoose.model<IAdmin>('Admin', AdminSchema);
