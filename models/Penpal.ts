// models/Penpal.js
import mongoose from 'mongoose';

const PenpalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {  // Added field
    type: String,
    required: true,
  },
  country: {  // Added field
    type: String,
    required: true,
  },
  interests: {
    type: String,
    required: true,
  },
  discordHandle: {
    type: String,
    required: false,
  },
  mailPreference: {
    type: String,
    enum: ['letters', 'packages'],
    required: true,
  },
  mailLocation: {
    type: String,
    enum: ['domestic', 'international'],
    required: true,
  },
  exchangeTypes: {
    friendBooks: {
      type: Boolean,
      default: false,
    },
    artJournal: {
      type: Boolean,
      default: false,
    },
    zine: {
      type: Boolean,
      default: false,
    },
    letters: {
      type: Boolean,
      default: false,
    },
    giftExchange: {
      type: Boolean,
      default: false,
    },
  },
}, { timestamps: true });

export default mongoose.models.Penpal || mongoose.model('Penpal', PenpalSchema);