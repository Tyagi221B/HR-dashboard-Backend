import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide employee ID'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for leave'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
);

export const Leave = mongoose.model("Leave", leaveSchema);