import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
)

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static('public'));
app.use(cookieParser());

// import routes
import healthcheckRouter from './routes/healthcheck.routes.js'; 
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import candidateRoutes from './routes/cdd.routes.js';
import employeeRouter from './routes/employee.routes.js';
import leaveRouter from './routes/leave.routes.js';

app.use('/api/v1/healthcheck', healthcheckRouter);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/candidate", candidateRoutes);

app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/leaves", leaveRouter);





app.use(errorHandler);

export { app }