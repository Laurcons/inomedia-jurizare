import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  school: string;
  locality: string;
  county: string;
  thumbnailUrl: string;
  youtubeUrl: string;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  school: { type: String, required: true },
  locality: { type: String, required: true },
  county: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
});

export default (mongoose.models.Video as mongoose.Model<IVideo>) || mongoose.model<IVideo>('Video', VideoSchema);
