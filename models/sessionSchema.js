//models/sessionSchema.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  publicSessionId: {
    type: String,
    required: true,
    
  },
  privateSessionId: {
    type: String,
    default:null,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  endsAt: {
    type: Date,
    default: () => {
      const now = new Date();
      now.setDate(now.getDate() + 7); // session expires in 7 days
      return now;
    },
    index: { expiresAfterSeconds: 0 }, // TTL index for auto-deletion
  },
  refreshToken: {
    type: String,
    default: null,
  },
  accessToken: {
    type: String,
    default: null,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
});

sessionSchema.index({ endsAt: 1 }, { expireAfterSeconds: 0 });

export const Sessions = mongoose.model("sessions", sessionSchema);