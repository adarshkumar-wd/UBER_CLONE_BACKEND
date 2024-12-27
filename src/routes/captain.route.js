import { Router } from "express";
import { body } from "express-validator";
import { loginCaptain, registerCaptain } from "../controllers/captain.controller.js";

const router = Router();

router.route("/register").post([
    body("fullName.firstName").notEmpty().withMessage("First Name is Required"),
    body("email").isEmail().withMessage("Email is Required"),
    body("password").isLength({min : 3}).withMessage("Password must be atleast 3 characters long."),
    body("vechile.color").notEmpty().withMessage("Color is Required"),
    body("vechile.vechileNumber").notEmpty().withMessage("Vechile Number is Required"),
    body("vechile.capacity").notEmpty().withMessage("Capacity is Required"),
    body("vechile.vechileType").notEmpty().withMessage("Vechile Type is Required"),
],registerCaptain);

router.route("/login").post([
    body("email").isEmail().withMessage("Email is Required"),
    body("password").isLength({min : 3}).withMessage("Password must be atleast 3 characters long."),
] , loginCaptain);

export default router;