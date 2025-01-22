import { Router } from "express";
import { body } from "express-validator";
import { loginCaptain, registerCaptain , logoutCaptain , captainProfile, validateCaptainToken} from "../controllers/captain.controller.js";
import {authCaptain} from "../middleweres/captainAuth.middleware.js";

const router = Router();

router.route("/captain-register").post([
    body("fullName.firstName").notEmpty().withMessage("First Name is Required"),
    body("email").isEmail().withMessage("Enter Valid email"),
    body("password").isLength({min : 3}).withMessage("Password must be atleast 3 characters long."),
    body("vechile.color").notEmpty().withMessage("Color is Required"),
    body("vechile.vechileNumber").notEmpty().withMessage("Vechile Number is Required"),
    body("vechile.capacity").notEmpty().withMessage("Capacity is Required"),
    body("vechile.vechileType").notEmpty().withMessage("Vechile Type is Required"),
],registerCaptain);

router.route("/captain-login").post([
    body("email").isEmail().withMessage("Email is Required"),
    body("password").isLength({min : 3}).withMessage("Password must be atleast 3 characters long."),
] , loginCaptain);

router.route("/captain-logout").get(authCaptain , logoutCaptain);

router.route("/captain-profile").get(authCaptain , captainProfile);

router.route("/validate-token").get(validateCaptainToken)


export default router;