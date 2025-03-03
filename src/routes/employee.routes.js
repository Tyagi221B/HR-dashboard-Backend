import { Router } from "express";
import { 
  getAllEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee,
  markAttendance,
  getEmployeeAttendance
} from "../controllers/employee.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/getall").get(getAllEmployees);
router.route("/:id").get(getEmployeeById);
router.put("/update/:id", verifyJWT, upload.single("pdfFile"), updateEmployee);
router.route("/delete/:id").delete(deleteEmployee);

router.route("/:id/attendance").post(markAttendance);
router.route("/:id/attendance").get(getEmployeeAttendance);

export default router;