import express from 'express';
import { 
  getAllLeaves, 
  getLeavesByEmployee, 
  createLeave, 
  updateLeaveStatus, 
  deleteLeave,
  getLeaveById,
  getLeaveDocument 
} from '../controllers/leave.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/getall', getAllLeaves);

router.get('/employee/:employeeId', getLeavesByEmployee);

router.get('/:id', getLeaveById);

router.post('/add', upload.single('pdfFile'), createLeave);

router.patch('/:id/status', updateLeaveStatus);

router.delete('/:id', deleteLeave);

router.get('/document/:employeeId', getLeaveDocument);

export default router;