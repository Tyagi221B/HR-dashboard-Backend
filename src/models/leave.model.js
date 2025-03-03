import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide employee']
    },
    leaveDate: {
      type: Date,
      required: [true, 'Please provide leave date']
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for leave']
    },
    pdfFile: {
      type: String, // Cloudinary public ID
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user']
    }
  },
  { timestamps: true }
);

export const Leave = mongoose.model("Leave", leaveSchema);