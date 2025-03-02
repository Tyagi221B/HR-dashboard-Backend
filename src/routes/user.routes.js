import { Router } from "express";
import { registerUser, refreshAccessToken, currentUser ,loginUser, logoutUser } from "../controllers/User.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);



// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, currentUser);
router.route("/refresh-token").post(refreshAccessToken);


export default router;