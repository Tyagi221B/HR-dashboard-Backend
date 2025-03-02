import { asyncHandler } from "../utils/asyncHandler.js";
import { Candidate } from "../models/candidate.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

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

  console.log(req.body);

  
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
  const candidates = await Candidate.find()

  return res
    .status(200)
    .json(new ApiResponse(200, candidates ,"Candidates retrieved successfully"));
});

export const deleteCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const candidate = await Candidate.findById(id);
  
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }
  
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

export const getResume = asyncHandler(async (req, res) => {

  const { id } = req.params;
  
  const candidate = await Candidate.findById(id);
  
  if (!candidate || !candidate.resumePublicId) {
    throw new ApiError(404, "Resume not found");
  }

  const resumeUrl = `https://res.cloudinary.com/asmitdemocloud/image/upload/${candidate.resumePublicId}.pdf`;

  res.status(200).json(new ApiResponse(200, { resumeUrl }, "Resume retrieved successfully"));
});

export const updateCandidate = asyncHandler(async (req, res) => {

  // TODO: FIX This -- no need right now
  const { id } = req.params;
  const updates = req.body;

  const candidate = await Candidate.findById(id);

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  if (candidate.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this candidate");
  }

  Object.assign(candidate, updates);
  await candidate.save();

  return res.status(200).json(new ApiResponse(200, "Candidate updated successfully", candidate));
});