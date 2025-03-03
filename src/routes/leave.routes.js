import { Router } from "express";
import { 
  applyForLeave, 
  getAllLeaves, 
  getLeaveById, 
  updateLeaveStatus,
  getEmployeeLeaves
} from "../controllers/leave.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(applyForLeave);
router.route("/").get(getAllLeaves);
router.route("/:id").get(getLeaveById);
router.route("/:id/status").patch(updateLeaveStatus);
router.route("/employee/:employeeId").get(getEmployeeLeaves);

export default router;