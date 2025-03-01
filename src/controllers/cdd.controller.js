import { asyncHandler } from "../utils/asyncHandler.js";
import { Candidate } from "../models/candidate.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

export const addCandidate = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    position,
    experience,
    department,
    dateOfJoining,
  } = req.body;

  console.log(req.user._id);

  
  if (
    [fullName, email, phone, position, experience, department].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await Candidate.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  if (!dateOfJoining) {
    throw new ApiError(400, "Please provide date of joining");
  }
  console.log(req.file)

  const resumeFileLocalPath = req.file;

  if (!resumeFileLocalPath) {
    throw new ApiError(400, "Resume file is required");
  }

  const resume = await uploadOnCloudinary(resumeFileLocalPath.path);

  if (!resume) {
    throw new ApiError(500, "Error uploading resume to cloudinary");
  }

  const candidate = await Candidate.create({
    fullName,
    email,
    phone,
    position,
    experience,
    department,
    dateOfJoining: new Date(dateOfJoining),
    resumePublicId: resume.public_id,
    createdBy: req.user._id,
  });

  const createdCandidate = await Candidate.findById(candidate._id);

  if (!createdCandidate) {
    throw new ApiError(500, "Something went wrong while adding a candidate");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Candidate added successfully", createdCandidate)
    );
});


