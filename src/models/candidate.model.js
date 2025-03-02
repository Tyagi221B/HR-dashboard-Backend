import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide candidate phone number'],
    },
    position: {
      type: String,
      required: [true, 'Please provide position applied for'],
    },
    experience: {
      type: Number,
      default: 0,
    },
    resumePublicId: {
      type: String,
      required: [true, 'Please provide candidate resume'],
    },
    status: {
      type: String,
      default: 'New',
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
    },
    dateOfJoining:{
      type: Date,
      required: [true, 'Please provide date of joining'],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
);

export const Candidate = mongoose.model("Candidate", candidateSchema);
