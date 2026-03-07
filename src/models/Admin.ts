import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  name: string;
  otp: string | null;
  otpExpiry: Date | null;
  otpSentAt: Date | null;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpSentAt: { type: Date, default: null },
});

export default (mongoose.models.Admin as mongoose.Model<IAdmin>) ||
  mongoose.model<IAdmin>('Admin', AdminSchema);
