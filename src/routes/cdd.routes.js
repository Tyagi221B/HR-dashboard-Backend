import { Router } from "express";
import { 
  addCandidate,
  updateCandidate, 
  deleteCandidate, 
  updateCandidateStatus,
  getAllCandidates,
  getResume
} from "../controllers/cdd.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = new Router();

router.route("/").post(verifyJWT, upload.single("pdfFile"), addCandidate);
router.delete("/delete/:id", verifyJWT, deleteCandidate);
router.get("/getall", verifyJWT, getAllCandidates);
router.get("/resume/:id", getResume);


router.put("/status/:id", verifyJWT, updateCandidateStatus);



// No need right now 
router.put("/update/:id", verifyJWT, updateCandidate);

export default router;