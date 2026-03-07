import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudentVote extends Document {
  teacherId: Types.ObjectId;
  studentName: string;
  studentClass: string;
  ranking: Types.ObjectId[];
  removed: boolean;
  createdAt: Date;
}

const StudentVoteSchema = new Schema<IStudentVote>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    studentName: { type: String, required: true },
    studentClass: { type: String, required: true },
    ranking: { type: [Schema.Types.ObjectId], ref: 'Video', required: true },
    removed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default (mongoose.models.StudentVote as mongoose.Model<IStudentVote>) ||
  mongoose.model<IStudentVote>('StudentVote', StudentVoteSchema);
