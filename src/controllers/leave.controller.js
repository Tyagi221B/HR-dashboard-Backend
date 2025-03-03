import { asyncHandler } from "../utils/asyncHandler.js";
import { Leave } from "../models/leave.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Apply for leave
export const applyForLeave = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;
  
  if (!employeeId || !startDate || !endDate || !reason) {
    throw new ApiError(400, "All fields are required");
  }
  
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  
  // Check if employee has attendance marked as Present
  const hasAttendance = employee.attendance.some(a => a.status === 'Present');
  if (!hasAttendance) {
    throw new ApiError(400, "Employee must have at least one day of attendance marked as Present before applying for leave");
  }
  
  // Create new leave request
  const leave = await Leave.create({
    employee: employeeId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    createdBy: req.user._id
  });
  
  return res
    .status(201)
    .json(new ApiResponse(201, leave, "Leave application submitted successfully"));
});

// Get all leaves
export const getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find()
    .populate('employee', 'fullName email department')
    .populate('approvedBy', 'fullName email');
  
  return res
    .status(200)
    .json(new ApiResponse(200, leaves, "Leaves retrieved successfully"));
});

// Get leave by ID
export const getLeaveById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const leave = await Leave.findById(id)
    .populate('employee', 'fullName email department')
    .populate('approvedBy', 'fullName email');
  
  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, leave, "Leave retrieved successfully"));
});

// Update leave status (approve/reject)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, "Valid status (Approved/Rejected) is required");
  }
  
  const leave = await Leave.findById(id);
  
  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }
  
  // Update leave status
  leave.status = status;
  leave.approvedBy = req.user._id;
  
  await leave.save();
  
  return res
    .status(200)
    .json(new ApiResponse(200, leave, `Leave ${status.toLowerCase()} successfully`));
});

// Get leaves for a specific employee
export const getEmployeeLeaves = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  
  const leaves = await Leave.find({ employee: employeeId })
    .populate('approvedBy', 'fullName email');
  
  return res
    .status(200)
    .json(new ApiResponse(200, leaves, "Employee leaves retrieved successfully"));
});