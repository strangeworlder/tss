import mongoose from 'mongoose';
import type { IGlobalDelaySettings, IContentOverride } from '../types/configuration';

interface IConfigurationDocument extends mongoose.Document {
  key: string;
  value: IGlobalDelaySettings | IContentOverride;
  createdAt: Date;
  updatedAt: Date;
}

const configurationSchema = new mongoose.Schema<IConfigurationDocument>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

configurationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model if it doesn't exist already
export const ConfigurationModel =
  mongoose.models.Configuration ||
  mongoose.model<IConfigurationDocument>('Configuration', configurationSchema);

export default ConfigurationModel;
