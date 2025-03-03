import { asyncHandler } from "../utils/asyncHandler.js";
import { Leave } from "../models/leave.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find()
    .populate({
      path: 'employee',
      select: 'fullName position'
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, leaves, "Leaves retrieved successfully")
    );
});

export const getLeavesByEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const leaves = await Leave.find({ employee: employeeId })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, leaves, "Employee leaves retrieved successfully")
    );
});

export const createLeave = asyncHandler(async (req, res) => {
  const { employeeId, leaveDate, reason } = req.body;

  if (!employeeId || !leaveDate || !reason) {
    throw new ApiError(400, "All fields are required");
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  let documentPublicId = null;

  if (req.file) {
    const documentUpload = await uploadOnCloudinary(req.file.path);
    
    if (!documentUpload) {
      throw new ApiError(500, "Error uploading document to Cloudinary");
    }

    documentPublicId = documentUpload.public_id;
  }

  const leave = await Leave.create({
    employee: employeeId,
    leaveDate: new Date(leaveDate),
    reason,
    documents: documentPublicId,
    status: "Pending",
    createdBy: req.user._id
  });

  const populatedLeave = await Leave.findById(leave._id).populate({
    path: 'employee',
    select: 'fullName position'
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedLeave, "Leave created successfully")
    );
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(status);

  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }

  if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, "Status must be Pending, Approved, or Rejected");
  }

  const leave = await Leave.findById(id);

  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }

  leave.status = status;
  await leave.save();

  const updatedLeave = await Leave.findById(id).populate({
    path: 'employee',
    select: 'fullName position'
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedLeave, "Leave status updated successfully")
    );
});

export const deleteLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }

  const leave = await Leave.findById(id);

  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }

  if (leave.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized to delete this leave");
  }

  if (leave.documents) {
    await deleteFromCloudinary(leave.documents);
  }

  await leave.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Leave deleted successfully")
    );
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Leave ID is required");
  }

  const leave = await Leave.findById(id).populate({
    path: 'employee',
    select: 'fullName position'
  });

  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, leave, "Leave retrieved successfully")
    );
});

export const getLeaveDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  if (!documentId) {
    throw new ApiError(400, "Document ID is required");
  }

  try {
    const documentUrl = await getCloudinaryUrl(documentId);
    
    if (!documentUrl) {
      throw new ApiError(404, "Document not found");
    }
    
    return res.redirect(documentUrl);
  } catch (error) {
    throw new ApiError(500, "Error retrieving document");
  }
  
});