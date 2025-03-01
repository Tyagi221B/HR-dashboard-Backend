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


export const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await Candidate.find().populate("createdBy", "fullName email");
  
  return res.status(200).json(new ApiResponse(200, "Candidates retrieved successfully", candidates));
});

export const deleteCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const candidate = await Candidate.findById(id);
  
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }
  
  // Ensure only the user who created the candidate can delete
  if (candidate.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this candidate");
  }
  
  await candidate.deleteOne();
  
  return res.status(200).json(new ApiResponse(200, "Candidate deleted successfully"));
});

export const updateCandidateStatus = async (req, res) => {

try {
  
    const { id } = req.params;
    const { status } = req.body;
  
    if (!id ){
      throw new ApiError(400, "Candidate ID is required");
    }  
  
    if (!status ){
      throw new ApiError(400, "Status is required");
    }
  
    const candidate = await Candidate.findByIdAndUpdate(id, { status }, { new: true });
  
    if (!candidate) {
      throw new ApiError(500, "Something went wrong while updating candidate status");
    } 

    return res
    .status(201)
    .json(
      new ApiResponse(201, "Candidate status updated succesfully", candidate.status)
    );

} catch (error) {
  throw new ApiError(500, "Error in updating candidate status", error)
}


}


// No nee right now - not in the requirement 
export const updateCandidate = asyncHandler(async (req, res) => {

  // TODO: FIX This -- no need right now
  const { id } = req.params;
  const updates = req.body;

  const candidate = await Candidate.findById(id);

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  // Ensure only the user who created the candidate can update
  if (candidate.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this candidate");
  }

  Object.assign(candidate, updates);
  await candidate.save();

  return res.status(200).json(new ApiResponse(200, "Candidate updated successfully", candidate));
});