import { Router } from "express";
import { registerUser , loginUser , logoutUser , userProfile, validateUserToken} from "../controllers/user.controller.js";
import { authUser } from "../middleweres/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(authUser , logoutUser);
router.route("/profile").get(authUser , userProfile);
router.route("/validate-token").get(validateUserToken)

export default router