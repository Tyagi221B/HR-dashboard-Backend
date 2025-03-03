import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
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
      required: [true, 'Please provide employee phone number'],
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
    },
    experience: {
      type: Number,
      default: 0,
    },
    resumePublicId: {
      type: String,
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Please provide date of joining'],
    },
    salary: {
      type: Number,
      default: 0,
    },
    candidateId: {
      type: mongoose.Types.ObjectId,
      ref: 'Candidate',
    },
    attendance: [{
      date: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present'
      },
      task: {
        type: String,
        default: ""
      },
      _id: false
    }],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", employeeSchema);