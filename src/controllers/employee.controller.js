import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find();

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees, "Employees retrieved successfully")
    );
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, employee, "Employee retrieved successfully")
    );
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    phone,
    position,
    experience,
    department,
    dateOfJoining,
    salary
  } = req.body;

  const employee = await Employee.findById(id);
  
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this employee");
  }

  let resumePublicId = employee.resumePublicId;

  if (req.file) {
    if (employee.resumePublicId) {
      await deleteFromCloudinary(employee.resumePublicId);
    }

    const resumeUpload = await uploadOnCloudinary(req.file.path);
    
    if (!resumeUpload) {
      throw new ApiError(500, "Error uploading new resume to Cloudinary");
    }

    resumePublicId = resumeUpload.public_id;
  }

  employee.fullName = fullName ?? employee.fullName;
  employee.email = email ?? employee.email;
  employee.phone = phone ?? employee.phone;
  employee.position = position ?? employee.position;
  employee.experience = experience ?? employee.experience;
  employee.department = department ?? employee.department;
  employee.dateOfJoining = dateOfJoining ? new Date(dateOfJoining) : employee.dateOfJoining;
  employee.salary = salary ?? employee.salary;
  employee.resumePublicId = resumePublicId;

  await employee.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee updated successfully", employee));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this employee");
  }

  if (employee.resumePublicId) {
    await deleteFromCloudinary(employee.resumePublicId);
  }

  await employee.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee deleted successfully"));
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, status } = req.body;
  
  if (!date) {
    throw new ApiError(400, "Date is required");
  }
  
  if (!["Present", "Absent"].includes(status)) {
    throw new ApiError(400, "Status must be either 'Present' or 'Absent'");
  }
  
  const attendanceDate = new Date(date);
  // Set time to beginning of day to avoid time comparison issues
  attendanceDate.setHours(0, 0, 0, 0);
  
  const employee = await Employee.findById(id);
  
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  
  // Check if attendance for this date already exists
  const existingAttendanceIndex = employee.attendance.findIndex(
    a => new Date(a.date).setHours(0, 0, 0, 0) === attendanceDate.getTime()
  );
  
  if (existingAttendanceIndex !== -1) {
    // Update existing attendance
    employee.attendance[existingAttendanceIndex].status = status;
  } else {
    // Add new attendance record
    employee.attendance.push({
      date: attendanceDate,
      status
    });
  }
  
  await employee.save();
  
  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance marked successfully", employee.attendance));
});

export const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  
  const employee = await Employee.findById(id);
  
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  
  let filteredAttendance = employee.attendance;
  
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    filteredAttendance = employee.attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate >= start && attendanceDate <= end;
    });
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, filteredAttendance, "Attendance retrieved successfully"));
});