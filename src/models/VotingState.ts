import mongoose, { Schema, Document } from 'mongoose';

export type VotingStatus = 'not_started' | 'active' | 'stopped';

export interface IVotingState extends Document {
  status: VotingStatus;
}

const VotingStateSchema = new Schema<IVotingState>({
  status: {
    type: String,
    enum: ['not_started', 'active', 'stopped'],
    default: 'not_started',
    required: true,
  },
});

export default (mongoose.models.VotingState as mongoose.Model<IVotingState>) ||
  mongoose.model<IVotingState>('VotingState', VotingStateSchema);
